"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { SwitchDialog, SwitchFormValues } from "./dialog";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { Position } from "@xyflow/react";
import { Shuffle } from "lucide-react";

type SwitchNodeData = {
    variableName?: string;
    propertyToCompare?: string;
    case1Value?: string;
    case2Value?: string;
    case3Value?: string;
};

type SwitchNodeType = Node<SwitchNodeData>;

export const SwitchNode = memo((props: NodeProps<SwitchNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: SwitchFormValues) => {
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
    const description = nodeData?.propertyToCompare
        ? `Compare: ${nodeData.propertyToCompare}`
        : "Not configured";

    return (
        <>
            <SwitchDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={Shuffle}
                name="Switch"
                status="initial"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                hideSourceHandle={true}
            >
                {/* Custom Output Handles for Case 1, 2, 3, and Default */}
                <BaseHandle
                    id="case1"
                    type="source"
                    position={Position.Right}
                    style={{ top: '20%', backgroundColor: '#3b82f6' }}
                />
                <span className="absolute right-[-45px] top-[12%] text-[9px] font-semibold text-blue-500">Case 1</span>

                <BaseHandle
                    id="case2"
                    type="source"
                    position={Position.Right}
                    style={{ top: '40%', backgroundColor: '#f59e0b' }}
                />
                <span className="absolute right-[-45px] top-[32%] text-[9px] font-semibold text-amber-500">Case 2</span>

                <BaseHandle
                    id="case3"
                    type="source"
                    position={Position.Right}
                    style={{ top: '60%', backgroundColor: '#10b981' }}
                />
                <span className="absolute right-[-45px] top-[52%] text-[9px] font-semibold text-emerald-500">Case 3</span>

                <BaseHandle
                    id="default"
                    type="source"
                    position={Position.Right}
                    style={{ top: '80%', backgroundColor: '#6b7280' }}
                />
                <span className="absolute right-[-45px] top-[72%] text-[9px] font-semibold text-gray-500">Default</span>
            </BaseExecutionNode>
        </>
    );
});

SwitchNode.displayName = "SwitchNode";
