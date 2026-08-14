import vm from "node:vm";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { javascriptChannel } from "@/inngest/channels/javascript";

type JavascriptData = {
  variableName?: string;
  code?: string;
};

export const javascriptExecutor: NodeExecutor<JavascriptData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    javascriptChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    const result = await step.run("javascript-execution", async () => {
      if (!data.variableName) {
        await publish(
          javascriptChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("JavaScript Node: Variable name not configured");
      }

      const code = data.code || `return { message: "No code provided" };`;

      // Define sandbox context with deep copy of the workflow context
      const sandbox = {
        context: JSON.parse(JSON.stringify(context)),
        console: {
          log: (...args: any[]) => console.log(`[JS Node ${nodeId}]:`, ...args),
          error: (...args: any[]) => console.error(`[JS Node ${nodeId}]:`, ...args),
        },
        // Common standard objects are already in VM, but let's make sure context is global
      };

      // Create the sandbox context
      vm.createContext(sandbox);

      // Wrap code in an IIFE to support top-level return statements
      const wrappedCode = `(function() {
        ${code}
      })()`;

      let executionResult: any;
      try {
        const script = new vm.Script(wrappedCode);
        executionResult = script.runInContext(sandbox, { timeout: 2000 }); // 2-second timeout to prevent infinite loops
      } catch (err: any) {
        await publish(
          javascriptChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError(`JavaScript execution failed: ${err.message}`);
      }

      // Ensure output is JSON-safe
      let safeOutput: any;
      try {
        safeOutput = JSON.parse(JSON.stringify(executionResult));
      } catch (err) {
        throw new NonRetriableError("JavaScript Node: Execution result must be JSON serializable");
      }

      return {
        ...context,
        [data.variableName]: safeOutput,
      };
    });

    await publish(
      javascriptChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      javascriptChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
