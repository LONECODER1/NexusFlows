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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MIN_INTERVAL_SECONDS,
  TIMER_PRESETS,
  amountAndUnitToSeconds,
  normalizeScheduleData,
  type ScheduleFormValues,
  type ScheduleTriggerData,
  type ScheduleUnit,
} from "./utils";

const formSchema = z
  .object({
    preset: z.string().min(1, "Timer preset is required"),
    amount: z.number().min(1, "Amount must be at least 1"),
    unit: z.enum(["minutes", "hours"]),
    intervalSeconds: z.number().min(MIN_INTERVAL_SECONDS),
  })
  .superRefine((values, ctx) => {
    if (values.preset !== "custom") {
      return;
    }

    const seconds = amountAndUnitToSeconds(values.amount, values.unit);
    if (seconds < MIN_INTERVAL_SECONDS) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum interval is 1 minute",
        path: ["amount"],
      });
    }
  });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ScheduleFormValues) => void;
  defaultValues?: Partial<ScheduleTriggerData>;
}

export const ScheduleDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const normalizedDefaults = useMemo(
    () => normalizeScheduleData(defaultValues),
    [defaultValues],
  );

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: normalizedDefaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(normalizedDefaults);
    }
  }, [open, normalizedDefaults, form]);

  const watchPreset = form.watch("preset");

  const handlePresetChange = (value: string) => {
    form.setValue("preset", value);

    const preset = TIMER_PRESETS.find((item) => item.value === value);
    if (preset && preset.value !== "custom") {
      form.setValue("intervalSeconds", preset.seconds);
    }
  };

  const handleSubmit = (values: ScheduleFormValues) => {
    const intervalSeconds =
      values.preset === "custom"
        ? amountAndUnitToSeconds(values.amount, values.unit)
        : values.intervalSeconds;

    onSubmit({
      ...values,
      intervalSeconds,
    });
    onOpenChange(false);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Timer</DialogTitle>
          <DialogDescription>
            Choose how often this workflow should run automatically. Saving
            here also saves the workflow so the timer can start.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="preset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timer Interval</FormLabel>
                  <Select
                    onValueChange={handlePresetChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a timer interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMER_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPreset === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Every</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={Number.isFinite(field.value) ? field.value : 1}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            field.onChange(
                              Number.isFinite(nextValue) && nextValue > 0
                                ? nextValue
                                : 1,
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              The scheduler checks every minute, so the shortest supported
              interval is 1 minute.
            </p>

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
