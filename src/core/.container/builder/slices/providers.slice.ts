import { db as drizzle } from "@briom/drizzle/db";
import { inngest } from "@briom/inngest/client";
import { openRouter } from "@briom/openrouter/client";
import { createPosthogClient } from "@briom/posthog/client";
import { createSupabaseServiceClient } from "@briom/supabase/client";
import { ContainerBuilder } from "@drimion";

/**
 * @description
 * Layer 0 — raw provider clients with zero domain knowledge.
 *
 * Every dependency here is a bare SDK/client instance: no ports
 * implemented, no business logic. `Layer1Adapters` wraps these behind
 * the port interfaces the application layer actually depends on.
 */
export const providersSlice = ContainerBuilder.create()
	.add("drizzle", () => drizzle)
	.add("inngest", () => inngest)
	.add("openRouter", () => openRouter)
	.add("posthog", () => createPosthogClient())
	.add("supabase", () => createSupabaseServiceClient());
