"use server";

import type { Realtime } from "@inngest/realtime";
import { slackChannel } from "@/inngest/channels/slack";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type SlackToken = Realtime.Token<
  typeof slackChannel,
  ["status"]
>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  return fetchRealtimeToken("slack", slackChannel(), ["status"]);
};
