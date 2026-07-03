CREATE TABLE "checkpoints" (
	"id" uuid PRIMARY KEY,
	"room_id" uuid NOT NULL,
	"content" text NOT NULL,
	"cover_sequences" integer NOT NULL,
	"iteration" integer NOT NULL,
	"generated_by" text NOT NULL,
	"previous_checkpoint_id" uuid,
	"usage_prompt_tokens" integer,
	"usage_completion_tokens" integer,
	"usage_cost_usd" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_movements" (
	"id" uuid PRIMARY KEY,
	"moderator_id" uuid NOT NULL,
	"amount" real NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderators" (
	"id" uuid PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"avatar" text,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "turns" DROP CONSTRAINT "turns_participant_id_participants_id_fk";--> statement-breakpoint
DROP TABLE "moderator_usage";--> statement-breakpoint
ALTER TABLE "turns" DROP CONSTRAINT "turns_room_sequence_unique";--> statement-breakpoint
DROP INDEX "participants_room_id_idx";--> statement-breakpoint
DROP INDEX "rooms_moderator_id_idx";--> statement-breakpoint
DROP INDEX "turns_room_status_idx";--> statement-breakpoint
DROP INDEX "turns_participant_idx";--> statement-breakpoint
DROP INDEX "turns_previous_turn_idx";--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "state_kind" text;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "state_reason" text;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "state_occurred_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "active_turn_id" uuid;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "turn_ids" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "checkpoint_ids" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "author_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "usage_prompt_tokens" integer;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "usage_completion_tokens" integer;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "usage_cost_usd" real;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "synthesis";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "synthesis_status";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "synthesis_created_at";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "synthesis_created_by";--> statement-breakpoint
ALTER TABLE "turns" DROP COLUMN "moderator_id";--> statement-breakpoint
ALTER TABLE "turns" DROP COLUMN "participant_id";--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "room_id" SET DATA TYPE uuid USING "room_id"::uuid;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "moderator_id" SET DATA TYPE uuid USING "moderator_id"::uuid;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET DATA TYPE text USING "status"::text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET DEFAULT 'forming';--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "room_id" SET DATA TYPE uuid USING "room_id"::uuid;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "author_type" SET DATA TYPE text USING "author_type"::text;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "intent" SET DATA TYPE text USING "intent"::text;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "content" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "status" SET DATA TYPE text USING "status"::text;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "previous_turn_id" SET DATA TYPE uuid USING "previous_turn_id"::uuid;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "settled_at" SET DATA TYPE timestamp with time zone USING "settled_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "turns" ALTER COLUMN "failed_at" SET DATA TYPE timestamp with time zone USING "failed_at"::timestamp with time zone;--> statement-breakpoint
CREATE INDEX "checkpoint_room_latest_idx" ON "checkpoints" ("room_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "credit_movement_moderator_audit_idx" ON "credit_movements" ("moderator_id","created_at");--> statement-breakpoint
CREATE INDEX "room_id_idx" ON "participants" ("room_id");--> statement-breakpoint
CREATE INDEX "rooms_moderator_updated_idx" ON "rooms" ("moderator_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "turn_room_sequence_idx" ON "turns" ("room_id","sequence" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "credit_movements" ADD CONSTRAINT "credit_movements_moderator_id_moderators_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "moderators"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_moderator_id_moderators_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "moderators"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "author_type";--> statement-breakpoint
DROP TYPE "intent";--> statement-breakpoint
DROP TYPE "room_status";--> statement-breakpoint
DROP TYPE "room_synthesis_status";--> statement-breakpoint
DROP TYPE "turn_status";