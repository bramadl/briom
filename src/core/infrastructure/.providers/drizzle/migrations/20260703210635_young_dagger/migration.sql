CREATE SCHEMA "meta";
--> statement-breakpoint
CREATE SCHEMA "moderator";
--> statement-breakpoint
CREATE SCHEMA "rooms";
--> statement-breakpoint
CREATE TABLE "rooms"."checkpoints" (
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
CREATE TABLE "moderator"."credit_movements" (
	"id" uuid PRIMARY KEY,
	"moderator_id" uuid NOT NULL,
	"amount" real NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta"."fx_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"from_currency" text NOT NULL,
	"to_currency" text NOT NULL,
	"rate" real NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator"."moderators" (
	"id" uuid PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"avatar" text,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms"."participants" (
	"id" uuid PRIMARY KEY,
	"room_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms"."rooms" (
	"id" uuid PRIMARY KEY,
	"moderator_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'forming' NOT NULL,
	"topic" text,
	"state_kind" text,
	"state_reason" text,
	"state_occurred_at" timestamp with time zone,
	"active_turn_id" uuid,
	"attachment_count" integer DEFAULT 0 NOT NULL,
	"turn_ids" jsonb DEFAULT '[]' NOT NULL,
	"checkpoint_ids" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms"."turns" (
	"id" uuid PRIMARY KEY,
	"room_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"author_type" text NOT NULL,
	"author_id" uuid NOT NULL,
	"intent" text,
	"previous_turn_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"content" text,
	"settled_at" timestamp with time zone,
	"error_kind" text,
	"error_message" text,
	"error_retry_after" integer,
	"failed_at" timestamp with time zone,
	"attachments" jsonb DEFAULT '[]' NOT NULL,
	"usage_prompt_tokens" integer,
	"usage_completion_tokens" integer,
	"usage_cost_usd" real,
	"abort_requested" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "checkpoint_room_latest_idx" ON "rooms"."checkpoints" ("room_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "credit_movement_moderator_audit_idx" ON "moderator"."credit_movements" ("moderator_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fx_rates_pair_unique" ON "meta"."fx_rates" ("from_currency","to_currency");--> statement-breakpoint
CREATE INDEX "room_id_idx" ON "rooms"."participants" ("room_id");--> statement-breakpoint
CREATE INDEX "rooms_moderator_updated_idx" ON "rooms"."rooms" ("moderator_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "turn_room_sequence_idx" ON "rooms"."turns" ("room_id","sequence" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "rooms"."checkpoints" ADD CONSTRAINT "checkpoints_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "moderator"."credit_movements" ADD CONSTRAINT "credit_movements_moderator_id_moderators_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "moderator"."moderators"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rooms"."participants" ADD CONSTRAINT "participants_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rooms"."rooms" ADD CONSTRAINT "rooms_moderator_id_moderators_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "moderator"."moderators"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rooms"."turns" ADD CONSTRAINT "turns_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"."rooms"("id") ON DELETE CASCADE;