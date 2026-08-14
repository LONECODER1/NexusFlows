"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { BaseTriggerNode } from "../base-trigger-node";
import { ClockIcon } from "lucide-react";
import { ScheduleDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger";
import { fetchScheduleTriggerRealtimeToken } from "./actions";
import { useSaveWorkflow } from "@/features/editor/hooks/use-save-workflow";
import {
  formatInterval,
  normalizeScheduleData,
  type ScheduleFormValues,
  type ScheduleTriggerData,
} from "./utils";

type ScheduleNodeType = Node<ScheduleTriggerData>;

export const ScheduleTriggerNode = memo((props: NodeProps<ScheduleNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const params = useParams<{ workflowId: string }>();
  const workflowId = params.workflowId;
  const { saveWorkflow, isSaving } = useSaveWorkflow(workflowId);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SCHEDULE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchScheduleTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = async (values: ScheduleFormValues) => {
    const nextNodes = getNodes().map((node) => {
      if (node.id !== props.id) {
        return node;
      }

      return {
        ...node,
        data: {
          intervalSeconds: values.intervalSeconds,
          preset: values.preset,
          amount: values.amount,
          unit: values.unit,
        },
      };
    });

    setNodes(nextNodes);

    try {
      await saveWorkflow(nextNodes, getEdges());
      toast.success(
        `Schedule saved (${formatInterval(values.intervalSeconds)}). Timer is now active.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save workflow schedule",
      );
    }
  };

  const normalized = normalizeScheduleData(props.data);
  const description = formatInterval(normalized.intervalSeconds);

  return (
    <>
      {dialogOpen && (
        <ScheduleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={props.data}
        />
      )}
      <BaseTriggerNode
        {...props}
        icon={ClockIcon}
        name="Schedule Timer"
        description={isSaving ? "Saving schedule..." : description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ScheduleTriggerNode.displayName = "ScheduleTriggerNode";
