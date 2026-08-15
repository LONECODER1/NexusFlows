"use server";

import type { Realtime } from "@inngest/realtime";
import { javascriptChannel } from "@/inngest/channels/javascript";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type JavascriptToken = Realtime.Token<
  typeof javascriptChannel,
  ["status"]
>;

export async function fetchJavascriptRealtimeToken(): Promise<JavascriptToken> {
  return fetchRealtimeToken("javascript", javascriptChannel(), ["status"]);
};
