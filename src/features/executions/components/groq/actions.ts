"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { groqChannel } from "@/inngest/channels/groq";
import { inngest } from "@/inngest/client";

export type GroqToken = Realtime.Token<
  typeof groqChannel,
  ["status"]
>;

export async function fetchGroqRealtimeToken(): Promise<GroqToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: groqChannel(),
    topics: ["status"],
  });

  return token;
};