"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { javascriptChannel } from "@/inngest/channels/javascript";
import { inngest } from "@/inngest/client";

export type JavascriptToken = Realtime.Token<
  typeof javascriptChannel,
  ["status"]
>;

export async function fetchJavascriptRealtimeToken(): Promise<JavascriptToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: javascriptChannel(),
    topics: ["status"],
  });

  return token;
};
