"use server";

import type { Realtime } from "@inngest/realtime";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type ScheduleTriggerToken = Realtime.Token<
  typeof scheduleTriggerChannel,
  ["status"]
>;

export async function fetchScheduleTriggerRealtimeToken(): Promise<ScheduleTriggerToken> {
  return fetchRealtimeToken(
    "schedule-trigger",
    scheduleTriggerChannel(),
    ["status"],
  );
};
