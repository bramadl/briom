import * as ApplicationLayer from "@briom/core/app";
import {
	AbortTurnCommand,
	AcceptProposalCommand,
	AnalyticsEventSubscriber,
	CloseRoomCommand,
	ConcludeRoomCommand,
	FormRoomCommand,
	GenerateCheckpointCommand,
	GenerateTopicCommand,
	GetModeratorQuery,
	GetProposalsQuery,
	GetRoomQuery,
	GetRoomsQuery,
	GetTurnQuery,
	InitiateTurnCommand,
	InviteParticipantCommand,
	RegisterModeratorCommand,
	RenameRoomCommand,
	RetryTurnCommand,
	RoomsEventSubscriber,
	StreamTurnCommand,
	TurnsEventSubscriber,
	UninviteParticipantCommand,
} from "@briom/core/app";
import { assertBus, CommandBus, QueryBus } from "@drimion";

import { handlersSlice } from "./handlers.slice";

/**
 * @description
 * Layer 4/5 — wires every handler into the `CommandBus`/`QueryBus` and
 * registers every event subscriber against the `eventBus`.
 *
 * Both are done via `registerEvent()` hooks rather than `.add()` tokens
 * because they're side-effecting registration steps, not values to be
 * resolved and reused — `commandBus`/`queryBus` ARE `.add()` tokens
 * (the bus instances themselves), but populating them with handler
 * registrations happens as a hook that runs once every other token in
 * the container has already resolved.
 */
export const busesSlice = handlersSlice
	.add("commandBus", () => new CommandBus())
	.add("queryBus", () => new QueryBus())

	.registerEvent((r) => {
		const registerHandler = r["handler:moderators:register"];

		const closeHandler = r["handler:rooms:close"];
		const concludeHandler = r["handler:rooms:conclude"];
		const formHandler = r["handler:rooms:form"];
		const generateCheckpointHandler = r["handler:rooms:generate-checkpoint"];
		const generateTopicHandler = r["handler:rooms:generate-topic"];
		const inviteParticipantHandler = r["handler:rooms:invite-participant"];
		const uninviteParticipantHandler = r["handler:rooms:uninvite-participant"];
		const renameHandler = r["handler:rooms:rename"];

		const abortTurnHandler = r["handler:turns:abort"];
		const acceptProposalHandler = r["handler:turns:accept-proposal"];
		const initiateTurnHandler = r["handler:turns:initiate"];
		const retryTurnHandler = r["handler:turns:retry"];
		const streamTurnHandler = r["handler:turns:stream"];

		const getModerator = r["handler:query:get-moderator"];
		const getProposalsHandler = r["handler:query:get-proposals"];
		const getRoomHandler = r["handler:query:get-room"];
		const getRoomsHandler = r["handler:query:get-rooms"];
		const getTurnHandler = r["handler:query:get-turn"];

		// ====================================================================
		// Command Bus
		// ====================================================================
		r.commandBus
			// ----- Moderators -------------------------------------------------
			.register(RegisterModeratorCommand, registerHandler)

			// ----- Rooms ------------------------------------------------------
			.register(CloseRoomCommand, closeHandler)
			.register(ConcludeRoomCommand, concludeHandler)
			.register(FormRoomCommand, formHandler)
			.register(GenerateCheckpointCommand, generateCheckpointHandler)
			.register(GenerateTopicCommand, generateTopicHandler)
			.register(InviteParticipantCommand, inviteParticipantHandler)
			.register(UninviteParticipantCommand, uninviteParticipantHandler)
			.register(RenameRoomCommand, renameHandler)

			// ----- Turns ------------------------------------------------------
			.register(AbortTurnCommand, abortTurnHandler)
			.register(AcceptProposalCommand, acceptProposalHandler)
			.register(InitiateTurnCommand, initiateTurnHandler)
			.register(RetryTurnCommand, retryTurnHandler)
			.register(StreamTurnCommand, streamTurnHandler);

		// ====================================================================
		// Query Bus
		// ====================================================================
		r.queryBus
			.register(GetModeratorQuery, getModerator)
			.register(GetProposalsQuery, getProposalsHandler)
			.register(GetRoomQuery, getRoomHandler)
			.register(GetRoomsQuery, getRoomsHandler)
			.register(GetTurnQuery, getTurnHandler);

		// ====================================================================
		// Assertions: Throws error on runtime when buses missing registration.
		// ====================================================================
		(
			[
				[r.commandBus, "commandBus", "Command"],
				[r.queryBus, "queryBus", "Query"],
			] as const
		).forEach(([bus, name, suffix]) => {
			assertBus({
				bus,
				busName: name,
				module: ApplicationLayer,
				suffix,
			});
		});
	})

	.registerEvent((r) => {
		const tracker = r["analytics:tracker:posthog"];
		const eventBus = r["eventBus:drimion"];
		const broadcaster = r["broadcaster:supabase-realtime"];
		const roomRepository = r["repository:room"];

		new AnalyticsEventSubscriber(tracker).register(eventBus);
		new RoomsEventSubscriber(broadcaster).register(eventBus);
		new TurnsEventSubscriber(broadcaster, roomRepository).register(eventBus);
	});
