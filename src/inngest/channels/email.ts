import { channel, topic } from "@inngest/realtime";

export const EMAIL_CHANNEL_NAME = "email-execution";

export const emailChannel = channel(EMAIL_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
