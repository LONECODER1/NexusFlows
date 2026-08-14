-- AlterTable
ALTER TABLE "user" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- Backfill existing users: trial ends 30 days after signup
UPDATE "user" SET "trialEndsAt" = "createdAt" + INTERVAL '30 days' WHERE "trialEndsAt" IS NULL;
