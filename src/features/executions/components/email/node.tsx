"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { EmailDialog, EmailFormValues } from "./dialog";
import { MailIcon } from "lucide-react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchEmailRealtimeToken } from "./actions";
import { EMAIL_CHANNEL_NAME } from "@/inngest/channels/email";
import { useSaveWorkflow } from "@/features/editor/hooks/use-save-workflow";

type EmailNodeData = {
    credentialId?: string;
    to?: string;
    subject?: string;
    body?: string;
};

type EmailNodeType = Node<EmailNodeData>;

export const EmailNode = memo((props: NodeProps<EmailNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes, getNodes, getEdges } = useReactFlow();
    const params = useParams<{ workflowId: string }>();
    const workflowId = params.workflowId;
    const { saveWorkflow, isSaving } = useSaveWorkflow(workflowId);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: EMAIL_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchEmailRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = async (values: EmailFormValues) => {
        const nextNodes = getNodes().map((node) => {
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
        });

        setNodes(nextNodes);

        try {
            await saveWorkflow(nextNodes, getEdges());
            toast.success("Email settings saved. Scheduled runs will use these settings.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save email settings",
            );
        }
    };

    const nodeData = props.data;
    const description = nodeData?.to
        ? `To: ${nodeData.to}${isSaving ? " (saving...)" : ""}`
        : isSaving
          ? "Saving..."
          : "Not configured";

    return (
        <>
            <EmailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={MailIcon}
                name="Send Email"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

EmailNode.displayName = "EmailNode";
