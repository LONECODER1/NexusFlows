"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { IfElseDialog, IfElseFormValues } from "./dialog";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

type IfElseNodeData = {
    condition?: string;
};

type IfElseNodeType = Node<IfElseNodeData>;

export const IfElseNode = memo((props: NodeProps<IfElseNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: IfElseFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
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
        }));
    };

    const nodeData = props.data;
    const description = nodeData?.condition
        ? `IF: ${nodeData.condition}`
        : "Not configured";

    return (
        <>
            <IfElseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GitBranch}
                name="If / Else"
                status="initial"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                hideSourceHandle={true}
            >
                {/* Custom Output Handles for True and False */}
                <BaseHandle
                    id="true"
                    type="source"
                    position={Position.Right}
                    style={{ top: '30%', backgroundColor: '#22c55e' }}
                />
                <span className="absolute right-[-32px] top-[21%] text-[10px] font-semibold text-green-500">True</span>

                <BaseHandle
                    id="false"
                    type="source"
                    position={Position.Right}
                    style={{ top: '70%', backgroundColor: '#ef4444' }}
                />
                <span className="absolute right-[-36px] top-[61%] text-[10px] font-semibold text-red-500">False</span>
            </BaseExecutionNode>
        </>
    );
});

IfElseNode.displayName = "IfElseNode";
