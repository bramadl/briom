CREATE TYPE "public"."room_synthesis_status" AS ENUM ('idle', 'pending', 'completed', 'failed');

--> statement-breakpoint
ALTER TABLE "rooms"
ADD COLUMN "synthesis" text;

--> statement-breakpoint
ALTER TABLE "rooms"
ADD COLUMN "synthesis_status" "room_synthesis_status" DEFAULT 'idle' NOT NULL;

--> statement-breakpoint
ALTER TABLE "rooms"
ADD COLUMN "synthesis_created_at" timestamp;

--> statement-breakpoint
ALTER TABLE "rooms"
ADD COLUMN "synthesis_created_by" text;