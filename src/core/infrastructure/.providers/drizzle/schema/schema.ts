import * as pg from "drizzle-orm/pg-core";

export const metaSchema = pg.snakeCase.schema("meta");
export const moderatorSchema = pg.snakeCase.schema("moderator");
export const roomSchema = pg.snakeCase.schema("rooms");
