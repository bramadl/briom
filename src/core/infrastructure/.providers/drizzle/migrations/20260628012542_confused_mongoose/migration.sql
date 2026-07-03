CREATE TABLE
  "moderator_usage" (
    "moderator_id" text PRIMARY KEY NOT NULL,
    "turn_count" integer DEFAULT 0 NOT NULL,
    "period_start" timestamp DEFAULT now () NOT NULL
  );