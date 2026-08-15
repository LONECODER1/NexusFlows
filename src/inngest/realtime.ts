import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import type { Inngest } from "inngest";
import { inngest } from "./client";

type RealtimeChannel = Parameters<typeof getSubscriptionToken>[1]["channel"];
type RealtimeTopics = Parameters<typeof getSubscriptionToken>[1]["topics"];

export async function fetchRealtimeToken<
  TChannel extends RealtimeChannel,
  TTopics extends RealtimeTopics,
>(
  label: string,
  channel: TChannel,
  topics: TTopics,
  client: Inngest = inngest,
): Promise<Realtime.Token<Realtime.Channel.AsChannel<TChannel>, TTopics>> {
  try {
    return (await getSubscriptionToken(client, { channel: channel as any, topics })) as unknown as Realtime.Token<
      Realtime.Channel.AsChannel<TChannel>,
      TTopics
    >;
  } catch (error) {
    console.error(`[Inngest Realtime] Failed to fetch token for ${label}:`, error);

    const message =
      error instanceof Error ? error.message : "Unknown Inngest realtime error";

    throw new Error(
      `Failed to connect to Inngest realtime (${label}): ${message}. ` +
        "Ensure INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY are set in production " +
        "and INNGEST_DEV is not enabled on Vercel.",
    );
  }
}
