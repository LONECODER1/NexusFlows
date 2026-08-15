"use server";

import type { Realtime } from "@inngest/realtime";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type StripeTriggerToken = Realtime.Token<
  typeof stripeTriggerChannel,
  ["status"]
>;

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> {
  return fetchRealtimeToken(
    "stripe-trigger",
    stripeTriggerChannel(),
    ["status"],
  );
};
