import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { scheduleCronRunner } from "@/inngest/cron-runner";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow,
    scheduleCronRunner,
  ],
});

export const dynamic = 'force-dynamic';