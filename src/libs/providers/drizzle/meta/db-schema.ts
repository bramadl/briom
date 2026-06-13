import { pgSchema } from "drizzle-orm/pg-core";

export const enumsSchema = pgSchema("enums");
export const participantsSchema = pgSchema("participants");
export const roomsSchema = pgSchema("rooms");
export const turnsSchema = pgSchema("turns");
