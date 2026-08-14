import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { scheduleTriggerChannel } from "./channels/schedule-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAiChannel } from "./channels/openai";
import { groqChannel } from "./channels/groq";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { javascriptChannel } from "./channels/javascript";
import { emailChannel } from "./channels/email";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    concurrency: {
      limit: 1,
      key: "event.data.workflowId",
    },
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({
      event,
    }: {
      event: {
        data: {
          event: { id: string };
          error: { message: string; stack?: string };
        };
      };
    }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      scheduleTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      groqChannel(),
      openAiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
      javascriptChannel(),
      emailChannel(),
    ],
  },
  async ({
    event,
    step,
    publish,
  }: {
    event: { id: string; data: { workflowId: string;[key: string]: any } };
    step: any;
    publish: any;
  }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });
    
    const { sortedNodes, connections } = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return {
        sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
        connections: workflow.connections,
      };
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });

      return workflow.userId;
    });

    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};
    let skippedNodeIds = new Set<string>();

    // Execute each node
    for (const node of sortedNodes) {
      if (skippedNodeIds.has(node.id)) {
        const outgoingConnections = connections.filter((c: any) => c.fromNodeId === node.id);
        outgoingConnections.forEach((c: any) => skippedNodeIds.add(c.toNodeId));
        continue;
      }

      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });

      if (context?._branchOutcome) {
        const skippedConnections = connections.filter(
            (c: any) => c.fromNodeId === node.id && c.fromOutput !== context._branchOutcome
        );
        skippedConnections.forEach((c: any) => skippedNodeIds.add(c.toNodeId));
      }
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      })
    });

    return {
      workflowId,
      result: context,
    };
  },
);