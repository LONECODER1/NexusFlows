import { inngest } from "./client";
import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma";
import {
  getScheduleEventId,
  normalizeScheduleData,
  shouldRunTimer,
  type ScheduleTriggerData,
} from "@/features/triggers/components/schedule-trigger/utils";

type DueWorkflow = {
  workflowId: string;
  intervalSeconds: number;
  eventId: string;
  timestamp: string;
};

export const scheduleCronRunner = inngest.createFunction(
  {
    id: "schedule-cron-runner",
    concurrency: { limit: 1 },
  },
  {
    cron: "* * * * *",
  },
  async ({ step }) => {
    const dueWorkflows = await step.run("collect-due-workflows", async () => {
      const now = new Date();

      const scheduledWorkflows = await prisma.workflow.findMany({
        where: {
          nodes: {
            some: {
              type: NodeType.SCHEDULE_TRIGGER,
            },
          },
        },
        select: {
          id: true,
          nodes: {
            where: {
              type: NodeType.SCHEDULE_TRIGGER,
            },
            select: {
              id: true,
              data: true,
            },
            take: 1,
          },
        },
      });

      const due: DueWorkflow[] = [];

      for (const workflow of scheduledWorkflows) {
        const scheduleNode = workflow.nodes[0];
        if (!scheduleNode) {
          continue;
        }

        const data = (scheduleNode.data || {}) as ScheduleTriggerData;
        const normalized = normalizeScheduleData(data);
        const intervalSeconds = normalized.intervalSeconds;

        if (!shouldRunTimer(intervalSeconds, data.lastScheduledRunAt, now)) {
          continue;
        }

        const timestamp = now.toISOString();

        await prisma.node.update({
          where: { id: scheduleNode.id },
          data: {
            data: {
              ...data,
              ...normalized,
              lastScheduledRunAt: timestamp,
            },
          },
        });

        due.push({
          workflowId: workflow.id,
          intervalSeconds,
          eventId: getScheduleEventId(workflow.id, intervalSeconds, now),
          timestamp,
        });
      }

      return due;
    });

    for (const item of dueWorkflows) {
      await step.sendEvent(`trigger-scheduled-${item.workflowId}`, {
        name: "workflows/execute.workflow",
        data: {
          workflowId: item.workflowId,
          initialData: {
            triggeredBy: "SCHEDULE_TRIGGER",
            timestamp: item.timestamp,
            intervalSeconds: item.intervalSeconds,
          },
        },
        id: item.eventId,
      });
    }

    return {
      triggeredCount: dueWorkflows.length,
      triggeredWorkflowIds: dueWorkflows.map((item) => item.workflowId),
      checkedAt: dueWorkflows[0]?.timestamp ?? new Date().toISOString(),
    };
  },
);
