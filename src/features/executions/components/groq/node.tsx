"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GroqDialog, GroqFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGroqRealtimeToken } from "./actions";
import { GROQ_CHANNEL_NAME } from "@/inngest/channels/groq";

type GroqNodeData = {
    variableName?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

type GroqNodeType = Node<GroqNodeData>;

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GROQ_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGroqRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: GroqFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        },
                    };
                }
                return node;
            })
        );
    };

    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `groq-llama-3.3-70b: ${nodeData.userPrompt.slice(0, 40)}...`
        : "Not configured";

    return (
        <>
            <GroqDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/groq.svg"
                name="Groq"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

GroqNode.displayName = "GroqNode";
