CREATE TYPE "public"."author_type" AS ENUM ('moderator', 'participant');

--> statement-breakpoint
CREATE TYPE "public"."intent" AS ENUM (
  'respond',
  'critique',
  'expand',
  'challenge',
  'summarize',
  'direct'
);

--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM ('forming', 'deliberating', 'paused', 'concluded');

--> statement-breakpoint
CREATE TYPE "public"."turn_status" AS ENUM (
  'pending',
  'streaming',
  'settled',
  'failed',
  'abandoned'
);

--> statement-breakpoint
CREATE TABLE
  "participants" (
    "id" text PRIMARY KEY NOT NULL,
    "room_id" text NOT NULL,
    "provider" text NOT NULL,
    "model" text NOT NULL,
    "display_name" text NOT NULL
  );

--> statement-breakpoint
CREATE TABLE
  "rooms" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "moderator_id" text NOT NULL,
    "status" "room_status" DEFAULT 'forming' NOT NULL,
    "topic" text,
    "created_at" timestamp DEFAULT now () NOT NULL
  );

--> statement-breakpoint
CREATE TABLE
  "turns" (
    "id" text PRIMARY KEY NOT NULL,
    "room_id" text NOT NULL,
    "sequence" integer NOT NULL,
    "author_type" "author_type" NOT NULL,
    "moderator_id" text,
    "participant_id" text,
    "intent" "intent",
    "content" text DEFAULT '' NOT NULL,
    "status" "turn_status" DEFAULT 'pending' NOT NULL,
    "previous_turn_id" text,
    "error_kind" text,
    "error_message" text,
    "error_retry_after" integer,
    "created_at" timestamp DEFAULT now () NOT NULL,
    "settled_at" timestamp,
    "failed_at" timestamp,
    CONSTRAINT "turns_room_sequence_unique" UNIQUE ("room_id", "sequence")
  );

--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants" ("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "turns_room_status_idx" ON "turns" USING btree ("room_id", "status");

--> statement-breakpoint
CREATE INDEX "turns_participant_idx" ON "turns" USING btree ("participant_id");

--> statement-breakpoint
CREATE INDEX "turns_previous_turn_idx" ON "turns" USING btree ("previous_turn_id");