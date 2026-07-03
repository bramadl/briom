import {
	AbortTurnCommand,
	type AbortTurnInput,
	AcceptProposalCommand,
	type AcceptProposalInput,
	CloseRoomCommand,
	type CloseRoomInput,
	ConcludeRoomCommand,
	type ConcludeRoomInput,
	FormRoomCommand,
	type FormRoomInput,
	type GetProposalsInput,
	GetProposalsQuery,
	type GetRoomInput,
	GetRoomQuery,
	type GetRoomsInput,
	GetRoomsQuery,
	type GetTurnInput,
	GetTurnQuery,
	InitiateTurnCommand,
	type InitiateTurnInput,
	InviteParticipantCommand,
	type InviteParticipantInput,
	RegisterModeratorCommand,
	type RegisterModeratorInput,
	RenameRoomCommand,
	type RenameRoomInput,
	RetryTurnCommand,
	type RetryTurnInput,
	UninviteParticipantCommand,
	type UninviteParticipantInput,
} from "@briom/core/app";

import { busesSlice } from "./slices/buses.slice";

/**
 * @description
 * Final build step. `.build()` resolves every token in registration
 * order (see `ContainerBuilder.build()`), then runs the two
 * `registerEvent()` hooks from `./buses.ts` — first populating
 * `commandBus`/`queryBus` with every handler, then registering every
 * event subscriber against `eventBus`.
 *
 * This runs once per Lambda cold start (module-level side effect,
 * same pattern as `db`/`openRouter` client singletons elsewhere in the
 * infra layer) — see the container design discussion for why
 * re-running this on every cold start, but never mid-warm-instance, is
 * the correct and expected serverless behavior.
 */
export const resolvedContainer = busesSlice.build();

/**
 * @description
 * Layer 6 — the facade every Server Action, Inngest function, and route
 * handler calls into: `briom.rooms.conclude(input)`.
 */
export function facadeBriom(container: typeof resolvedContainer) {
	const { commandBus, queryBus } = container;

	return {
		moderators: {
			register: (input: RegisterModeratorInput) =>
				commandBus.execute(new RegisterModeratorCommand(input)),
		},

		rooms: {
			close: (input: CloseRoomInput) =>
				commandBus.execute(new CloseRoomCommand(input)),

			conclude: (input: ConcludeRoomInput) =>
				commandBus.execute(new ConcludeRoomCommand(input)),

			form: (input: FormRoomInput) =>
				commandBus.execute(new FormRoomCommand(input)),

			participants: {
				invite: (input: InviteParticipantInput) =>
					commandBus.execute(new InviteParticipantCommand(input)),

				uninvite: (input: UninviteParticipantInput) =>
					commandBus.execute(new UninviteParticipantCommand(input)),
			},

			rename: (input: RenameRoomInput) =>
				commandBus.execute(new RenameRoomCommand(input)),

			get: (input: GetRoomInput) => queryBus.execute(new GetRoomQuery(input)),

			all: (input: GetRoomsInput) => queryBus.execute(new GetRoomsQuery(input)),
		},

		turns: {
			abort: (input: AbortTurnInput) =>
				commandBus.execute(new AbortTurnCommand(input)),

			acceptProposal: (input: AcceptProposalInput) =>
				commandBus.execute(new AcceptProposalCommand(input)),

			initiate: (input: InitiateTurnInput) =>
				commandBus.execute(new InitiateTurnCommand(input)),

			retry: (input: RetryTurnInput) =>
				commandBus.execute(new RetryTurnCommand(input)),

			get: (input: GetTurnInput) => queryBus.execute(new GetTurnQuery(input)),

			proposals: (input: GetProposalsInput) =>
				queryBus.execute(new GetProposalsQuery(input)),
		},
	} as const;
}

export type BriomFacade = ReturnType<typeof facadeBriom>;
