export const TRIAL_DAYS = 30;

export function getTrialEndDate(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

export function isTrialActive(trialEndsAt: Date | string | null | undefined): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}
