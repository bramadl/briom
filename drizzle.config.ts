import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * @description
 * Load local env in local development only.
 * Vercel adds VERCEL env by default that we can use to check
 * against. Vercel also resolves env vars automatically so
 * this code should never break (just for an extra-defense).
 */
if (!process.env.VERCEL) dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

export default defineConfig({
	out: "./src/core/infrastructure/.providers/drizzle/migrations",
	schema: "./src/core/infrastructure/.providers/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url: databaseUrl },
});
