ALTER TABLE "rooms" ADD COLUMN "attachment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL;