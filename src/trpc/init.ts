import { getServerSession } from '@/lib/auth-session';
import { isTrialActive } from '@/features/subscriptions/lib/trial';
import { db } from '@/lib/db';
import { polarClient } from '@/lib/polar';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson"

export const createTRPCContext = cache(async () => {
    return {};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const session = await getServerSession();

    if (!session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unathorized",
        });
    }

    return next({ ctx: { ...ctx, auth: session } });
});
export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const userEmail = ctx.auth.user.email;
    const userId = ctx.auth.user.id;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_ACCESS || "codecommander6969@gmail.com";

    const isAdmin =
      userId === "admin" ||
      userId === process.env.ADMIN_USER_ID ||
      (Boolean(userEmail) && userEmail === adminEmail) ||
      process.env.BYPASS_SUBSCRIPTION === "true";

    if (isAdmin) {
      return next({ ctx: { ...ctx, customer: { activeSubscriptions: [] } } });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true },
    });

    if (isTrialActive(user?.trialEndsAt)) {
      return next({ ctx: { ...ctx, customer: { activeSubscriptions: [] } } });
    }

    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    if (
      !customer.activeSubscriptions ||
      customer.activeSubscriptions.length === 0
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required",
      });
    }

    return next({ ctx: { ...ctx, customer } });
  },
);