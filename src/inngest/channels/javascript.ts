import { channel, topic } from "@inngest/realtime";

export const JAVASCRIPT_CHANNEL_NAME = "javascript-execution";

export const javascriptChannel = channel(JAVASCRIPT_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
