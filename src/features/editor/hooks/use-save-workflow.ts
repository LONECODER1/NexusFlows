"use client";

import { useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";
import type { Edge, Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export function toWorkflowPayload(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}

export function useSaveWorkflow(workflowId: string) {
  const { getNodes, getEdges } = useReactFlow();
  const updateWorkflow = useUpdateWorkflow();

  const saveWorkflow = useCallback(
    async (nodesOverride?: Node[], edgesOverride?: Edge[]) => {
      const nodes = nodesOverride ?? getNodes();
      const edges = edgesOverride ?? getEdges();
      const payload = toWorkflowPayload(nodes, edges);

      return updateWorkflow.mutateAsync({
        id: workflowId,
        ...payload,
      });
    },
    [workflowId, getNodes, getEdges, updateWorkflow],
  );

  return {
    saveWorkflow,
    isSaving: updateWorkflow.isPending,
  };
}
