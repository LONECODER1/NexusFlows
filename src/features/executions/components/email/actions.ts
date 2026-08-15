"use server";

import type { Realtime } from "@inngest/realtime";
import { emailChannel } from "@/inngest/channels/email";
import { fetchRealtimeToken } from "@/inngest/realtime";

export type EmailToken = Realtime.Token<
  typeof emailChannel,
  ["status"]
>;

export async function fetchEmailRealtimeToken(): Promise<EmailToken> {
  return fetchRealtimeToken("email", emailChannel(), ["status"]);
};
