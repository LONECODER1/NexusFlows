import { channel, topic } from "@inngest/realtime";

export const ANTHROPIC_CHANNEL_NAME = "anthropic-execution";

export const anthropicChannel = channel(ANTHROPIC_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>(),
  );