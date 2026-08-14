"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";
import { inngest } from "@/inngest/client";

export type ScheduleTriggerToken = Realtime.Token<
  typeof scheduleTriggerChannel,
  ["status"]
>;

export async function fetchScheduleTriggerRealtimeToken(): Promise<ScheduleTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: scheduleTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
