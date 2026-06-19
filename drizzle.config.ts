import type { Config } from "drizzle-kit";

const connectionUrl = process.env.DATABASE_URL;
if (!connectionUrl) throw new Error("DATABASE_URL is required");

export default {
	schema: "./src/libs/providers/drizzle/schema.ts",
	out: "./src/libs/providers/drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: { url: connectionUrl },
	migrations: {
		prefix: "index",
		table: "__drizzle_migrations__",
		schema: "public",
	},
	strict: false,
} satisfies Config;
