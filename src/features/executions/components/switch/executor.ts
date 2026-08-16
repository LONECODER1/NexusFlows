import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";

type SwitchData = {
  variableName?: string;
  propertyToCompare?: string;
  case1Value?: string;
  case2Value?: string;
  case3Value?: string;
};

export const switchExecutor: NodeExecutor<SwitchData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.propertyToCompare) {
    throw new NonRetriableError("Switch node: Property to compare is required");
  }

  const rawProperty = Handlebars.compile(data.propertyToCompare)(context);
  const propertyValue = decode(rawProperty).trim();

  try {
    const result = await step.run("switch-route", async () => {
      const case1 = data.case1Value ? Handlebars.compile(data.case1Value)(context).trim() : "";
      const case2 = data.case2Value ? Handlebars.compile(data.case2Value)(context).trim() : "";
      const case3 = data.case3Value ? Handlebars.compile(data.case3Value)(context).trim() : "";

      let matchedBranch = "default";
      if (case1 && propertyValue === case1) {
        matchedBranch = "case1";
      } else if (case2 && propertyValue === case2) {
        matchedBranch = "case2";
      } else if (case3 && propertyValue === case3) {
        matchedBranch = "case3";
      }

      if (!data.variableName) {
        throw new NonRetriableError("Switch node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          matchedCase: matchedBranch,
        },
      };
    });

    return result;
  } catch (error) {
    throw error;
  }
};
