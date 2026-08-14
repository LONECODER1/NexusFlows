import type { NodeExecutor } from "../../types";

export const ifElseExecutor: NodeExecutor<{ condition?: string }> = async ({
    data,
    context,
}) => {
    // Basic evaluation of the condition string based on context data
    // Usually this requires a safe Javascript evaluator, but for this basic clone
    // we do a simple replacement and evaluation.

    let isTrue = false;

    try {
        if (!data.condition || typeof data.condition !== "string") {
            throw new Error("Condition not provided or invalid.");
        }

        // Extremely basic evaluation for demonstration purposes:
        // Replace {{variableName.foo}} with their actual values from context
        let evaluatedCondition = data.condition;
        
        // Match {{ ... }}
        const regex = /\{\{(.*?)\}\}/g;
        evaluatedCondition = evaluatedCondition.replace(regex, (match: string, p1: string) => {
            const keys = p1.trim().split('.');
            let value: any = context;
            for (const key of keys) {
                if (value && typeof value === 'object') {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            // Safely format as string for eval
            if (typeof value === 'string') return `"${value}"`;
            return String(value);
        });

        // Use a Function constructor for a basic eval (safest native alternative to eval)
        isTrue = new Function(`return ${evaluatedCondition}`)();
    } catch (error) {
        console.error("Failed to evaluate IF/ELSE condition:", error);
        isTrue = false;
    }

    return {
        ...context,
        _branchOutcome: isTrue ? "true" : "false"
    };
};
