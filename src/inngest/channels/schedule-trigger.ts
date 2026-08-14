import { channel, topic } from "@inngest/realtime";

export const SCHEDULE_TRIGGER_CHANNEL_NAME = "schedule-trigger-execution";

export const scheduleTriggerChannel = channel(SCHEDULE_TRIGGER_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
