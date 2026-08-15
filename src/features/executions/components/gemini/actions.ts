"use server";

import type { Realtime } from "@inngest/realtime";
import { geminiChannel } from "@/inngest/channels/gemini";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type GeminiToken = Realtime.Token<
  typeof geminiChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  return fetchRealtimeToken("gemini", geminiChannel(), ["status"]);
};
