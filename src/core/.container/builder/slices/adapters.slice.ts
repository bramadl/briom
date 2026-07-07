import {
	DrizzleRoomUnitOfWork,
	DrizzleTurnAbortSignal,
	FrankfurterFxRateGateway,
	InngestCheckpointGenerator,
	InngestTopicGenerator,
	InngestTurnGenerator,
	InngestTurnRealtimePublisher,
	OpenRouterLLMGateway,
	PinoLogger,
	PostHogAnalyticsTracker,
	SupabaseRoomRealtimePublisher,
} from "@briom/core/infra/adapters";
import {
	DrizzleCheckpointRepository,
	DrizzleCreditMovementRepository,
	DrizzleGetModeratorQuery,
	DrizzleGetRoomQuery,
	DrizzleGetRoomsQuery,
	DrizzleGetTurnQuery,
	DrizzleModeratorRepository,
	DrizzleRoomRepository,
	DrizzleTurnRepository,
} from "@briom/core/infra/database";
import { EventBus } from "@drimion";

import { providersSlice } from "./providers.slice";

/**
 * @description
 * Layer 1 — adapters implementing every ports the application layer needs.
 *
 * Each factory here depends only on Layer 0 providers, never on another Layer
 * 1 adapter — repositories, gateways, and trackers are independent of one
 * another by design.
 */
export const adaptersSlice = providersSlice
	// ==========================================================================
	// Cross-cutting Infra Concerns
	// ==========================================================================

	.add("logger:pino", () => new PinoLogger())

	.add("eventBus:drimion", () => new EventBus())

	.add("analytics:tracker:posthog", (r) => {
		const client = r.posthog;
		return new PostHogAnalyticsTracker(client);
	})

	.add("publisher:room-realtime:supabase", (r) => {
		const client = r.supabase;
		const logger = r["logger:pino"];

		return new SupabaseRoomRealtimePublisher(client, logger);
	})

	.add("publisher:turn-realtime:inngest", (r) => {
		const client = r.inngest;
		return new InngestTurnRealtimePublisher(client);
	})

	.add("signal:turn-abort:drizzle", (r) => {
		const db = r.drizzle;
		return new DrizzleTurnAbortSignal(db);
	})

	.add("gateway:fx-rate:frankfurter", (r) => {
		const db = r.drizzle;
		return new FrankfurterFxRateGateway(db);
	})

	.add("gateway:llm:openrouter", (r) => {
		const client = r.openRouter;
		const logger = r["logger:pino"];

		return new OpenRouterLLMGateway(client, logger);
	})

	.add("generator:turn:inngest", (r) => {
		const client = r.inngest;
		return new InngestTurnGenerator(client);
	})

	.add("generator:topic:inngest", (r) => {
		const client = r.inngest;
		return new InngestTopicGenerator(client);
	})

	.add("generator:checkpoint:inngest", (r) => {
		const client = r.inngest;
		return new InngestCheckpointGenerator(client);
	})

	// ==========================================================================
	// Database: Repositories (non-transactional)
	// ==========================================================================

	.add("repository:moderator", (r) => {
		const db = r.drizzle;
		return new DrizzleModeratorRepository(db);
	})

	.add("repository:room", (r) => {
		const db = r.drizzle;
		return new DrizzleRoomRepository(db);
	})

	.add("repository:turn", (r) => {
		const db = r.drizzle;
		return new DrizzleTurnRepository(db);
	})

	.add("repository:checkpoint", (r) => {
		const db = r.drizzle;
		return new DrizzleCheckpointRepository(db);
	})

	.add("repository:credit-movement", (r) => {
		const db = r.drizzle;
		return new DrizzleCreditMovementRepository(db);
	})

	// ==========================================================================
	// Database: Queries
	// ==========================================================================

	.add("query:get-moderator", (r) => {
		const db = r.drizzle;
		return new DrizzleGetModeratorQuery(db);
	})

	.add("query:get-room", (r) => {
		const db = r.drizzle;
		return new DrizzleGetRoomQuery(db);
	})

	.add("query:get-rooms", (r) => {
		const db = r.drizzle;
		return new DrizzleGetRoomsQuery(db);
	})

	.add("query:get-turn", (r) => {
		const db = r.drizzle;
		return new DrizzleGetTurnQuery(db);
	})

	// ==========================================================================
	// Database: Unit of Work (transactionals)
	// ==========================================================================

	.add("unit-of-work:room", (r) => {
		const db = r.drizzle;
		return new DrizzleRoomUnitOfWork(db);
	});
