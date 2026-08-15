"use server";

import type { Realtime } from "@inngest/realtime";
import { groqChannel } from "@/inngest/channels/groq";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type GroqToken = Realtime.Token<
  typeof groqChannel,
  ["status"]
>;

export async function fetchGroqRealtimeToken(): Promise<GroqToken> {
  return fetchRealtimeToken("groq", groqChannel(), ["status"]);
};
