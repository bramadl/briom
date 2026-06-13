CREATE SCHEMA IF NOT EXISTS "enums";

--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "participants";

--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "rooms";

--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "turns";

--> statement-breakpoint
CREATE TYPE "enums"."ai_provider" AS ENUM ('openai', 'anthropic', 'google');

--> statement-breakpoint
CREATE TYPE "enums"."author_type" AS ENUM ('user', 'participant');

--> statement-breakpoint
CREATE TYPE "enums"."intent" AS ENUM (
  'respond',
  'critique',
  'summarize',
  'challenge',
  'expand'
);

--> statement-breakpoint
CREATE TABLE
  "participants"."participants" (
    "id" text PRIMARY KEY NOT NULL,
    "room_id" text NOT NULL,
    "provider" "enums"."ai_provider" NOT NULL,
    "model" text NOT NULL,
    "display_name" text NOT NULL
  );

--> statement-breakpoint
CREATE TABLE
  "rooms"."rooms" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "created_at" timestamp DEFAULT now () NOT NULL
  );

--> statement-breakpoint
CREATE TABLE
  "turns"."turns" (
    "id" text PRIMARY KEY NOT NULL,
    "room_id" text NOT NULL,
    "sequence_number" integer NOT NULL,
    "author_type" "enums"."author_type" NOT NULL,
    "participant_id" text,
    "intent" "enums"."intent",
    "content" text NOT NULL,
    "created_at" timestamp DEFAULT now () NOT NULL,
    CONSTRAINT "turns_room_sequence_unique" UNIQUE ("room_id", "sequence_number")
  );

--> statement-breakpoint
ALTER TABLE "participants"."participants" ADD CONSTRAINT "participants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"."rooms" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "turns"."turns" ADD CONSTRAINT "turns_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"."rooms" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "turns"."turns" ADD CONSTRAINT "turns_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"."participants" ("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "turns_room_sequence_idx" ON "turns"."turns" USING btree ("room_id", "sequence_number");