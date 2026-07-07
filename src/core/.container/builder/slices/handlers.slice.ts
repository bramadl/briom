import {
	AbortTurnHandler,
	AcceptProposalHandler,
	CloseRoomHandler,
	ConcludeRoomHandler,
	FormRoomHandler,
	GenerateCheckpointHandler,
	GenerateTopicHandler,
	GetModeratorHandler,
	GetProposalsHandler,
	GetRoomHandler,
	GetRoomsHandler,
	GetTurnHandler,
	InitiateTurnHandler,
	InviteParticipantHandler,
	RegisterModeratorHandler,
	RenameRoomHandler,
	RetryTurnHandler,
	StreamTurnHandler,
	UninviteParticipantHandler,
} from "@briom/core/app";
import { servicesSlice } from "./services.slice";

/**
 * @description
 * Layer 3 — every command and query handler in the application, constructed
 * with their Layer 1/2 dependencies already resolved.
 *
 * Handlers are grouped by aggregate/module (moderators, rooms, turns, queries
 * ) purely for readability here — `CommandBus`/`QueryBus` registration (see
 * `./buses.ts`) is what actually gives them their externally-visible identity
 * , keyed by Command/Query class.
 */
export const handlersSlice = servicesSlice
	// =========================================================================
	// Moderators
	// =========================================================================

	.add("handler:moderators:register", (r) => {
		const moderatorRepository = r["repository:moderator"];
		const eventBus = r["eventBus:drimion"];

		return new RegisterModeratorHandler(moderatorRepository, eventBus);
	})

	// =========================================================================
	// Rooms
	// =========================================================================

	.add("handler:rooms:close", (r) => {
		const roomRepository = r["repository:room"];
		return new CloseRoomHandler(roomRepository);
	})

	.add("handler:rooms:conclude", (r) => {
		const roomRepository = r["repository:room"];
		const eventBus = r["eventBus:drimion"];

		return new ConcludeRoomHandler(roomRepository, eventBus);
	})

	.add("handler:rooms:form", (r) => {
		const moderatorRepository = r["repository:moderator"];
		const roomRepository = r["repository:room"];
		const eventBus = r["eventBus:drimion"];

		return new FormRoomHandler(moderatorRepository, roomRepository, eventBus);
	})

	.add("handler:rooms:generate-checkpoint", (r) => {
		const roomRepository = r["repository:room"];
		const turnRepository = r["repository:turn"];
		const checkpointRepository = r["repository:checkpoint"];
		const moderatorRepository = r["repository:moderator"];
		const transcriptorRenderer = r["service:transcriptorRenderer"];
		const llmGateway = r["gateway:llm:openrouter"];
		const eventBus = r["eventBus:drimion"];

		return new GenerateCheckpointHandler(
			roomRepository,
			turnRepository,
			checkpointRepository,
			moderatorRepository,
			transcriptorRenderer,
			llmGateway,
			eventBus,
		);
	})

	.add("handler:rooms:generate-topic", (r) => {
		const roomRepository = r["repository:room"];
		const llmGateway = r["gateway:llm:openrouter"];
		const eventBus = r["eventBus:drimion"];
		const logger = r["logger:pino"];

		return new GenerateTopicHandler(
			roomRepository,
			llmGateway,
			eventBus,
			logger,
		);
	})

	.add("handler:rooms:invite-participant", (r) => {
		const moderatorRepository = r["repository:moderator"];
		const roomRepository = r["repository:room"];

		return new InviteParticipantHandler(moderatorRepository, roomRepository);
	})

	.add("handler:rooms:uninvite-participant", (r) => {
		const roomRepository = r["repository:room"];
		return new UninviteParticipantHandler(roomRepository);
	})

	.add("handler:rooms:rename", (r) => {
		const roomRepository = r["repository:room"];
		return new RenameRoomHandler(roomRepository);
	})

	// =========================================================================
	// Turns
	// =========================================================================

	.add("handler:turns:abort", (r) => {
		const roomRepository = r["repository:room"];
		const turnRepository = r["repository:turn"];
		const turnAbortSignal = r["signal:turn-abort:drizzle"];

		return new AbortTurnHandler(
			roomRepository,
			turnRepository,
			turnAbortSignal,
		);
	})

	.add("handler:turns:accept-proposal", (r) => {
		const roomUnitOfWork = r["unit-of-work:room"];
		const eventBus = r["eventBus:drimion"];
		const turnGenerator = r["generator:turn:inngest"];
		const logger = r["logger:pino"];

		return new AcceptProposalHandler(
			roomUnitOfWork,
			eventBus,
			turnGenerator,
			logger,
		);
	})

	.add("handler:turns:initiate", (r) => {
		const moderatorRepository = r["repository:moderator"];
		const roomUnitOfWork = r["unit-of-work:room"];
		const eventBus = r["eventBus:drimion"];
		const turnGenerator = r["generator:turn:inngest"];
		const topicGenerator = r["generator:topic:inngest"];
		const logger = r["logger:pino"];

		return new InitiateTurnHandler(
			moderatorRepository,
			roomUnitOfWork,
			eventBus,
			turnGenerator,
			topicGenerator,
			logger,
		);
	})

	.add("handler:turns:retry", (r) => {
		const roomRepository = r["repository:room"];
		const turnRepository = r["repository:turn"];
		const turnGenerator = r["generator:turn:inngest"];
		const eventBus = r["eventBus:drimion"];

		return new RetryTurnHandler(
			roomRepository,
			turnRepository,
			turnGenerator,
			eventBus,
		);
	})

	.add("handler:turns:stream", (r) => {
		const moderatorRepository = r["repository:moderator"];
		const creditMovementRepository = r["repository:credit-movement"];
		const roomRepository = r["repository:room"];
		const checkpointRepository = r["repository:checkpoint"];
		const turnRepository = r["repository:turn"];
		const streamConsumer = r["service:streamConsumer"];
		const transcriptorRenderer = r["service:transcriptorRenderer"];
		const llmGateway = r["gateway:llm:openrouter"];
		const fxRateGateway = r["gateway:fx-rate:frankfurter"];
		const checkpointGenerator = r["generator:checkpoint:inngest"];
		const eventBus = r["eventBus:drimion"];
		const logger = r["logger:pino"];

		return new StreamTurnHandler(
			moderatorRepository,
			creditMovementRepository,
			roomRepository,
			checkpointRepository,
			turnRepository,
			streamConsumer,
			transcriptorRenderer,
			llmGateway,
			fxRateGateway,
			checkpointGenerator,
			eventBus,
			logger,
		);
	})

	// =========================================================================
	// Queries
	// =========================================================================

	.add("handler:query:get-moderator", (r) => {
		const query = r["query:get-moderator"];
		const moderatorRepository = r["repository:moderator"];

		return new GetModeratorHandler(query, moderatorRepository);
	})

	.add("handler:query:get-proposals", (r) => {
		const roomRepository = r["repository:room"];
		const turnRepository = r["repository:turn"];

		return new GetProposalsHandler(roomRepository, turnRepository);
	})

	.add("handler:query:get-room", (r) => {
		const query = r["query:get-room"];
		const moderatorRepository = r["repository:moderator"];

		return new GetRoomHandler(query, moderatorRepository);
	})

	.add("handler:query:get-rooms", (r) => {
		const query = r["query:get-rooms"];
		const moderatorRepository = r["repository:moderator"];

		return new GetRoomsHandler(query, moderatorRepository);
	})

	.add("handler:query:get-turn", (r) => {
		const query = r["query:get-turn"];
		return new GetTurnHandler(query);
	});
