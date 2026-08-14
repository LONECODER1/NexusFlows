"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { Code2Icon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { JavascriptFormValues, JavascriptDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { JAVASCRIPT_CHANNEL_NAME } from "@/inngest/channels/javascript";
import { fetchJavascriptRealtimeToken } from "./actions";

type JavascriptNodeData = {
  variableName?: string;
  code?: string;
};

type JavascriptNodeType = Node<JavascriptNodeData>;

export const JavaScriptNode = memo((props: NodeProps<JavascriptNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: JAVASCRIPT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchJavascriptRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: JavascriptFormValues) => {
    setNodes((nodes) => nodes.map((node) => {
      if (node.id === props.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...values,
          }
        }
      }
      return node;
    }))
  };

  const nodeData = props.data;
  const description = nodeData?.variableName
    ? `Output: ${nodeData.variableName}`
    : "Not configured";

  return (
    <>
      <JavascriptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={Code2Icon}
        name="JavaScript / Code"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
});

JavaScriptNode.displayName = "JavaScriptNode";
