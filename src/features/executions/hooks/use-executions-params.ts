import { useQueryStates } from "nuqs";
import { executionsParams } from "../params";

export const useExecutionsParams = () => {
  return useQueryStates(executionsParams);
};