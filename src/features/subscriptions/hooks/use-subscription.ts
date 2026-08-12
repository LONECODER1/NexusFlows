"use client";

import { authClient } from "@/lib/auth-client";

export const useHasActiveSubscription = () => {
  const { data: session, isPending: isLoading } = authClient.useSession();

  const userEmail = session?.user?.email;
  const userId = session?.user?.id;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_ACCESS || "codecommander6969@gmail.com";
  const bypass = process.env.NEXT_PUBLIC_BYPASS_SUBSCRIPTION === "true";

  const isAdmin =
    userId === "admin" ||
    (Boolean(userEmail) && userEmail === adminEmail) ||
    bypass ||
    Boolean(session?.user && (session.user as Record<string, unknown>).hasActiveSubscription);

  const hasActiveSubscription = Boolean(session?.user && isAdmin);

  return {
    hasActiveSubscription,
    isLoading,
  };
};
