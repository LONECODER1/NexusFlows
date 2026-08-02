import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params";

export const useWorkflowsParams = () => {
    return useQueryStates(workflowsParams);
};