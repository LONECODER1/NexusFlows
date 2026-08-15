"use server";

import type { Realtime } from "@inngest/realtime";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type AnthropicToken = Realtime.Token<
  typeof anthropicChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  return fetchRealtimeToken("anthropic", anthropicChannel(), ["status"]);
};
