"use server";

import type { Realtime } from "@inngest/realtime";
import { discordChannel } from "@/inngest/channels/discord";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type DiscordToken = Realtime.Token<
  typeof discordChannel,
  ["status"]
>;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  return fetchRealtimeToken("discord", discordChannel(), ["status"]);
};
