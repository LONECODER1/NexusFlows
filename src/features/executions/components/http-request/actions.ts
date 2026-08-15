"use server";

import type { Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type HttpRequestToken = Realtime.Token<
  typeof httpRequestChannel,
  ["status"]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
  return fetchRealtimeToken("http-request", httpRequestChannel(), ["status"]);
};
