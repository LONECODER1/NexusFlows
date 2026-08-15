"use server";

import type { Realtime } from "@inngest/realtime";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type ManualTriggerToken = Realtime.Token<
  typeof manualTriggerChannel,
  ["status"]
>;

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerToken> {
  return fetchRealtimeToken(
    "manual-trigger",
    manualTriggerChannel(),
    ["status"],
  );
};
