import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useSaveWorkflow } from "@/features/editor/hooks/use-save-workflow";
import { workflowExecutionActiveAtom } from "@/features/editor/store/atoms";
import { useSetAtom } from "jotai";
import { FlaskConicalIcon } from "lucide-react";

const EXECUTION_STATUS_WINDOW_MS = 120_000;

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const { saveWorkflow, isSaving } = useSaveWorkflow(workflowId);
  const setExecutionActive = useSetAtom(workflowExecutionActiveAtom);

  const handleExecute = async () => {
    setExecutionActive(true);

    try {
      await saveWorkflow();
      executeWorkflow.mutate(
        { id: workflowId },
        {
          onSettled: () => {
            window.setTimeout(() => {
              setExecutionActive(false);
            }, EXECUTION_STATUS_WINDOW_MS);
          },
        },
      );
    } catch (error) {
      console.error("[Workflows] Failed to save before execute:", error);
      setExecutionActive(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending || isSaving}
    >
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
