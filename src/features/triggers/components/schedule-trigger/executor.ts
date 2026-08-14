import type { NodeExecutor } from "@/features/executions/types";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";
import {
  resolveIntervalSeconds,
  type ScheduleTriggerData,
} from "./utils";

export const scheduleTriggerExecutor: NodeExecutor<ScheduleTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    scheduleTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("schedule-trigger", async () => {
    return {
      ...context,
      triggeredAt: new Date().toISOString(),
      intervalSeconds: resolveIntervalSeconds(data),
    };
  });

  await publish(
    scheduleTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
