"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { discordChannel } from "@/inngest/channels/discord";
import { inngest } from "@/inngest/client";

export type DiscordToken = Realtime.Token<
  typeof discordChannel,
  ["status"]
>;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: discordChannel(),
    topics: ["status"],
  });

  return token;
};