import { channel, topic } from "@inngest/realtime";

export const DISCORD_CHANNEL_NAME = "discord-execution";

export const discordChannel = channel(DISCORD_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>(),
  );