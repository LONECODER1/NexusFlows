import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { NodeExecutor } from "@/features/executions/types";
import { groqChannel } from "@/inngest/channels/groq";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type GroqData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const groqExecutor: NodeExecutor<GroqData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    groqChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Groq node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Groq node: Credential is required");
  }

  if (!data.userPrompt) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Groq node: User prompt is missing");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Groq node: Credential not found");
  }

  const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: decrypt(credential.value),
  });

  try {
    const { steps } = await step.ai.wrap(
      "groq-generate-text",
      generateText,
      {
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text = 
      steps[0].content[0].type === "text" 
        ? steps[0].content[0].text
        : "";
    
    await publish(
      groqChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
     await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
