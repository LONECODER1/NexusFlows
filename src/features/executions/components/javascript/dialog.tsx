"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SparklesIcon, BookOpenIcon, Code2Icon } from "lucide-react";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { 
      message: "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  code: z.string().min(1, { message: "JavaScript code cannot be empty" }),
});

export type JavascriptFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<JavascriptFormValues>;
}

const templates = [
  {
    name: "Format Date",
    description: "Format a ISO date to localized format",
    code: `// Format a date from previous node context or fallback
const rawDate = context.myApiCall?.httpResponse?.data?.createdAt || new Date().toISOString();
const formatted = new Date(rawDate).toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

return { 
  formattedDate: formatted 
};`
  },
  {
    name: "Moving Average",
    description: "Calculate simple moving average",
    code: `// Calculate 3-period simple moving average of price history
const prices = context.myApiCall?.httpResponse?.data?.prices || [100, 102, 105, 103, 108, 110, 115];
const period = 3;
const movingAverages = [];

for (let i = period - 1; i < prices.length; i++) {
  const windowSlice = prices.slice(i - period + 1, i + 1);
  const sum = windowSlice.reduce((sum, val) => sum + val, 0);
  movingAverages.push({
    index: i,
    price: prices[i],
    sma: Number((sum / period).toFixed(2))
  });
}

return { 
  movingAverages,
  latestSma: movingAverages[movingAverages.length - 1]?.sma
};`
  },
  {
    name: "Transform List Items",
    description: "Map and filter data items",
    code: `// Transform input array items
const items = context.myApiCall?.httpResponse?.data?.items || [
  { id: 1, name: "Premium Subscription", price: 29.99, active: true },
  { id: 2, name: "Basic Subscription", price: 9.99, active: false },
  { id: 3, name: "Enterprise Custom", price: 299.99, active: true }
];

// Keep only active products and format pricing structure
const transformed = items
  .filter(item => item.active)
  .map(item => ({
    productName: item.name.toUpperCase(),
    amountInCents: Math.round(item.price * 100)
  }));

return { 
  processedCount: transformed.length,
  products: transformed
};`
  },
  {
    name: "Relative Strength Index (RSI)",
    description: "Calculate 14-period financial RSI",
    code: `// Simple RSI indicator calculation
const prices = context.pricesNode?.httpResponse?.data || [44, 45, 46, 45, 44, 43, 44, 46, 47, 48, 49, 48, 47, 48, 49, 50];
if (prices.length < 15) {
  return { error: "Insufficient data points for RSI (minimum 15 required)" };
}

let gains = 0;
let losses = 0;

// First RSI calculation
for (let i = 1; i <= 14; i++) {
  const diff = prices[i] - prices[i - 1];
  if (diff > 0) gains += diff;
  else losses -= diff;
}

let avgGain = gains / 14;
let avgLoss = losses / 14;

// Calculate smoothed averages
for (let i = 15; i < prices.length; i++) {
  const diff = prices[i] - prices[i - 1];
  avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
  avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
}

const rs = avgGain / (avgLoss || 1);
const rsi = 100 - (100 / (1 + rs));

return { 
  rsi: Number(rsi.toFixed(2)),
  signal: rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL"
};`
  }
];

export const JavascriptDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      code: defaultValues.code || `// Access variables using context.nodeName\n// Output must be returned as an object\nreturn {\n  myFormattedData: "hello world"\n};`,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "transformedData",
        code: defaultValues.code || `// Access variables using context.nodeName\n// Output must be returned as an object\nreturn {\n  myFormattedData: "hello world"\n};`,
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "transformedData";

  const applyTemplate = (code: string) => {
    form.setValue("code", code);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/40">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-md">
                <Code2Icon className="size-5" />
              </div>
              <DialogTitle className="text-xl">Custom JavaScript / Code Node</DialogTitle>
            </div>
            <DialogDescription className="mt-1">
              Write small Javascript snippets directly in the canvas to run mathematical calculations or format date structures.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Double-Panel Split Layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* Left Panel: Form Settings */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="variableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Output Variable Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="transformedData"
                          className="bg-muted/30 focus-visible:ring-yellow-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Refer to this output in other nodes:{" "}
                        <code className="text-xs px-1 py-0.5 rounded bg-muted font-mono">{`{{${watchVariableName}.resultField}}`}</code>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-1">
                      <FormLabel className="text-sm font-semibold">JavaScript Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="return { result: context.myNode... };"
                          className="min-h-[280px] font-mono text-sm bg-zinc-950 text-zinc-100 p-4 border-zinc-800 rounded-md focus-visible:ring-yellow-500 resize-y leading-relaxed"
                          style={{ tabSize: 2 }}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Use a top-level <code className="text-xs px-1 py-0.5 rounded bg-muted font-mono">return</code> statement returning a JSON serializable object.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-2">
                  <Button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-white font-medium px-6">
                    Save Configuration
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>

          {/* Right Panel: Documentation & Quick Templates */}
          <div className="w-[340px] bg-muted/20 p-6 flex flex-col gap-6 overflow-y-auto select-none">
            
            {/* Context Docs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-1">
                <BookOpenIcon className="size-4 text-muted-foreground" />
                <span>Sandbox Context</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The entire workflow execution state is passed as a read-only global object named <code className="text-[11px] px-1 py-0.5 rounded bg-muted font-mono font-bold text-foreground">context</code>.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To extract output from preceding nodes, access their variable name. E.g. <code className="text-[11px] px-1 py-0.5 rounded bg-muted font-mono">context.myApiCall</code>.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-1">
                <SparklesIcon className="size-4 text-yellow-500" />
                <span>Quick Templates</span>
              </div>
              
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => applyTemplate(tmpl.code)}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-border bg-card text-left transition hover:bg-accent/50 hover:border-yellow-500/40 group cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-yellow-600">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {tmpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
