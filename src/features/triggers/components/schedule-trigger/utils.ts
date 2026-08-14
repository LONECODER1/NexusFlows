export type ScheduleUnit = "minutes" | "hours";

export type ScheduleTriggerData = {
  intervalSeconds?: number | string;
  preset?: string;
  amount?: number | string;
  unit?: ScheduleUnit | string;
  lastScheduledRunAt?: string;
  /** @deprecated legacy cron field */
  cron?: string;
  /** @deprecated legacy interval field */
  interval?: string;
};

export const TIMER_PRESETS = [
  { label: "Every 1 minute", value: "1m", seconds: 60 },
  { label: "Every 5 minutes", value: "5m", seconds: 300 },
  { label: "Every 15 minutes", value: "15m", seconds: 900 },
  { label: "Every 30 minutes", value: "30m", seconds: 1800 },
  { label: "Every 1 hour", value: "1h", seconds: 3600 },
  { label: "Custom interval", value: "custom", seconds: 0 },
] as const;

const LEGACY_CRON_TO_SECONDS: Record<string, number> = {
  "* * * * *": 60,
  "*/5 * * * *": 300,
  "*/15 * * * *": 900,
  "*/30 * * * *": 1800,
  "0 * * * *": 3600,
  "0 9 * * *": 86400,
};

export const MIN_INTERVAL_SECONDS = 60;

export const DEFAULT_SCHEDULE_DATA: ScheduleTriggerData = {
  intervalSeconds: 60,
  preset: "1m",
  amount: 1,
  unit: "minutes",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function normalizeScheduleData(
  data: unknown,
): ScheduleFormValues {
  const record =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as ScheduleTriggerData)
      : {};

  const intervalSeconds = resolveIntervalSeconds(record);
  const preset = getPresetFromSeconds(intervalSeconds);
  const customDefaults = getCustomDefaults(intervalSeconds);

  return {
    intervalSeconds,
    preset,
    amount: toNumber(record.amount) ?? customDefaults.amount,
    unit:
      record.unit === "hours" || record.unit === "minutes"
        ? record.unit
        : customDefaults.unit,
  };
}

export type ScheduleFormValues = {
  preset: string;
  amount: number;
  unit: ScheduleUnit;
  intervalSeconds: number;
};

export function amountAndUnitToSeconds(
  amount: number,
  unit: ScheduleUnit,
): number {
  if (unit === "hours") {
    return amount * 3600;
  }

  return amount * 60;
}

export function resolveIntervalSeconds(data: ScheduleTriggerData): number {
  const explicitSeconds = toNumber(data.intervalSeconds);
  if (explicitSeconds !== null && explicitSeconds >= MIN_INTERVAL_SECONDS) {
    return explicitSeconds;
  }

  const legacyCron = data.cron || data.interval;
  if (legacyCron && LEGACY_CRON_TO_SECONDS[legacyCron]) {
    return LEGACY_CRON_TO_SECONDS[legacyCron];
  }

  const preset = TIMER_PRESETS.find((item) => item.value === data.preset);
  if (preset && preset.value !== "custom") {
    return preset.seconds;
  }

  return MIN_INTERVAL_SECONDS;
}

export function formatInterval(seconds: number): string {
  const safeSeconds = toNumber(seconds) ?? MIN_INTERVAL_SECONDS;

  if (safeSeconds % 3600 === 0 && safeSeconds >= 3600) {
    const hours = safeSeconds / 3600;
    return hours === 1 ? "Every 1 hour" : `Every ${hours} hours`;
  }

  if (safeSeconds % 60 === 0) {
    const minutes = safeSeconds / 60;
    return minutes === 1 ? "Every 1 minute" : `Every ${minutes} minutes`;
  }

  return `Every ${safeSeconds} seconds`;
}

export function getScheduleEventId(
  workflowId: string,
  intervalSeconds: number,
  now: Date = new Date(),
): string {
  const bucket = Math.floor(now.getTime() / (intervalSeconds * 1000));
  return `schedule-${workflowId}-${bucket}`;
}

export function shouldRunTimer(
  intervalSeconds: number,
  lastScheduledRunAt: string | undefined,
  now: Date = new Date(),
): boolean {
  if (!lastScheduledRunAt) {
    return true;
  }

  const lastRun = new Date(lastScheduledRunAt);
  if (Number.isNaN(lastRun.getTime())) {
    return true;
  }

  const elapsedMs = now.getTime() - lastRun.getTime();
  return elapsedMs >= intervalSeconds * 1000;
}

export function getPresetFromSeconds(seconds: number): string {
  const safeSeconds = toNumber(seconds) ?? MIN_INTERVAL_SECONDS;
  const preset = TIMER_PRESETS.find(
    (item) => item.value !== "custom" && item.seconds === safeSeconds,
  );

  return preset?.value ?? "custom";
}

export function getCustomDefaults(seconds: number): {
  amount: number;
  unit: ScheduleUnit;
} {
  const safeSeconds = toNumber(seconds) ?? MIN_INTERVAL_SECONDS;

  if (safeSeconds % 3600 === 0 && safeSeconds >= 3600) {
    return { amount: safeSeconds / 3600, unit: "hours" };
  }

  return {
    amount: Math.max(1, Math.round(safeSeconds / 60)),
    unit: "minutes",
  };
}
