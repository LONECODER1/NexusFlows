"use server";

import type { Realtime } from "@inngest/realtime";
import { openAiChannel } from "@/inngest/channels/openai";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type OpenAiToken = Realtime.Token<
  typeof openAiChannel,
  ["status"]
>;

export async function fetchOpenAiRealtimeToken(): Promise<OpenAiToken> {
  return fetchRealtimeToken("openai", openAiChannel(), ["status"]);
};
