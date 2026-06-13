ALTER TABLE "participants"."participants"
ALTER COLUMN "provider"
SET
  DATA TYPE text;

--> statement-breakpoint
DROP TYPE "enums"."ai_provider";