import * as pg from "drizzle-orm/pg-core";

/**
 * @description
 * Database schema for `Moderator` aggregate persistence.
 */
export const moderatorsTable = pg.snakeCase.table("moderators", {
	/**
	 * @description
	 * Unique moderator identifier (UUID). Mirrors the Supabase Auth UID.
	 */
	id: pg.uuid().primaryKey(),

	/**
	 * @description
	 * Verified email address. Used for auth and notifications.
	 */
	email: pg.text().unique().notNull(),

	/**
	 * @description
	 * Display name shown across the platform.
	 */
	name: pg.text().notNull(),

	/**
	 * @description
	 * Profile picture URL, or null if not set.
	 */
	avatar: pg.text(),

	/**
	 * @description
	 * Current Briom Credit balance. Starts at 0.
	 */
	creditBalance: pg.integer().notNull().default(0),

	/**
	 * @description
	 * When this Moderator was registered.
	 */
	createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),

	/**
	 * @description
	 * When this Moderator's state was last mutated.
	 */
	updatedAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
});
