CREATE INDEX "participants_room_id_idx" ON "participants" USING btree ("room_id");

--> statement-breakpoint
CREATE INDEX "rooms_moderator_id_idx" ON "rooms" USING btree ("moderator_id");