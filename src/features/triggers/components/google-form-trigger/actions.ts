"use server";

import type { Realtime } from "@inngest/realtime";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type GoogleFormTriggerToken = Realtime.Token<
  typeof googleFormTriggerChannel,
  ["status"]
>;

export async function fetchGoogleFormTriggerRealtimeToken(): Promise<GoogleFormTriggerToken> {
  return fetchRealtimeToken(
    "google-form-trigger",
    googleFormTriggerChannel(),
    ["status"],
  );
};
