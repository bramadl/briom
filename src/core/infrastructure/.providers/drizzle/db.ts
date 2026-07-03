import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import {
	drizzle,
	type PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { relations } from "./relations";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const client = postgres(databaseUrl, { prepare: false });
export const db = drizzle({
	client,
	jit: true,
	relations,
});

export type DrizzleConn = typeof db | TransactionClient;
type TransactionClient = PgAsyncTransaction<
	PostgresJsQueryResultHKT,
	typeof relations
>;
