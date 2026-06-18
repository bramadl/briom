import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * @description
 * Database connection string from environment.
 *
 * Required for application startup. Throws if missing.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

/**
 * @description
 * PostgreSQL client using postgres.js driver.
 *
 * Configured with { prepare: false } for compatibility with connection pooling.
 */
const client = postgres(connectionString, { prepare: false });

/**
 * @description
 * Drizzle ORM instance with schema.
 *
 * Exported as `db` for direct use and as `Database` type for injection.
 */
export const db = drizzle(client, { schema });

/**
 * @description
 * Type alias for the Drizzle database instance.
 *
 * Used for dependency injection in repositories and queries.
 */
export type Database = typeof db;
