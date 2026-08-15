import { INNGEST_APP_ID } from "@/config/brand";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

function getInngestIsDev(): boolean {
  // Production deployments must always use Inngest Cloud, even if INNGEST_DEV
  // is copied from a local .env file into Vercel.
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const devFlag = process.env.INNGEST_DEV;

  if (devFlag === "0" || devFlag === "false") {
    return false;
  }

  if (devFlag === "1" || devFlag === "true" || devFlag?.startsWith("http")) {
    return true;
  }

  return true;
}

export const inngest = new Inngest({
  id: INNGEST_APP_ID,
  isDev: getInngestIsDev(),
  middleware: [realtimeMiddleware()],
});
