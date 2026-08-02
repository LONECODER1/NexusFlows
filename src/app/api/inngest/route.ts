// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processTask } from "./functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processTask],
});