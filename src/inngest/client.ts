import { INNGEST_APP_ID } from "@/config/brand";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

function getInngestIsDev(): boolean {
  const devFlag = process.env.INNGEST_DEV;

  if (devFlag === "0" || devFlag === "false") {
    return false;
  }

  if (devFlag === "1" || devFlag === "true" || devFlag?.startsWith("http")) {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}

export const inngest = new Inngest({
  id: INNGEST_APP_ID,
  isDev: getInngestIsDev(),
  middleware: [realtimeMiddleware()],
});
