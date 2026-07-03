CREATE TABLE "fx_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"from_currency" text NOT NULL,
	"to_currency" text NOT NULL,
	"rate" real NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "fx_rates_pair_unique" ON "fx_rates" ("from_currency","to_currency");