"use client";

import { authClient } from "@/lib/auth-client";

export const useHasActiveSubscription = () => {
  const { data: session, isPending: isLoading } = authClient.useSession();

  // Checks if session user has active subscription data attached by Polar plugin
  const hasActiveSubscription = Boolean(
    session?.user && (session.user as Record<string, unknown>).hasActiveSubscription
  );

  return {
    hasActiveSubscription,
    isLoading,
  };
};
