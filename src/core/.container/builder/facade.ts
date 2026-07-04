import {
	AbortTurnCommand,
	type AbortTurnInput,
	type AbortTurnOutput,
	AcceptProposalCommand,
	type AcceptProposalInput,
	type AcceptProposalOutput,
	CloseRoomCommand,
	type CloseRoomInput,
	type CloseRoomOutput,
	ConcludeRoomCommand,
	type ConcludeRoomInput,
	type ConcludeRoomOutput,
	FormRoomCommand,
	type FormRoomInput,
	type FormRoomOutput,
	type GetModeratorInput,
	type GetModeratorMetadata,
	type GetModeratorOutput,
	GetModeratorQuery,
	type GetProposalsInput,
	type GetProposalsOutput,
	GetProposalsQuery,
	type GetRoomInput,
	type GetRoomOutput,
	GetRoomQuery,
	type GetRoomsInput,
	type GetRoomsMetadata,
	type GetRoomsOutput,
	GetRoomsQuery,
	type GetTurnInput,
	type GetTurnOutput,
	GetTurnQuery,
	InitiateTurnCommand,
	type InitiateTurnInput,
	type InitiateTurnOutput,
	InviteParticipantCommand,
	type InviteParticipantInput,
	type InviteParticipantOutput,
	RegisterModeratorCommand,
	type RegisterModeratorInput,
	type RegisterModeratorOutput,
	RenameRoomCommand,
	type RenameRoomInput,
	type RenameRoomOutput,
	RetryTurnCommand,
	type RetryTurnInput,
	type RetryTurnOutput,
	UninviteParticipantCommand,
	type UninviteParticipantInput,
	type UninviteParticipantOutput,
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
			profile: (input: GetModeratorInput) =>
				queryBus.execute<GetModeratorOutput, never, GetModeratorMetadata>(
					new GetModeratorQuery(input),
				),

			register: (input: RegisterModeratorInput) =>
				commandBus.execute<RegisterModeratorOutput>(
					new RegisterModeratorCommand(input),
				),
		},

		rooms: {
			close: (input: CloseRoomInput) =>
				commandBus.execute<CloseRoomOutput>(new CloseRoomCommand(input)),

			conclude: (input: ConcludeRoomInput) =>
				commandBus.execute<ConcludeRoomOutput>(new ConcludeRoomCommand(input)),

			form: (input: FormRoomInput) =>
				commandBus.execute<FormRoomOutput>(new FormRoomCommand(input)),

			participants: {
				invite: (input: InviteParticipantInput) =>
					commandBus.execute<InviteParticipantOutput>(
						new InviteParticipantCommand(input),
					),

				uninvite: (input: UninviteParticipantInput) =>
					commandBus.execute<UninviteParticipantOutput>(
						new UninviteParticipantCommand(input),
					),
			},

			rename: (input: RenameRoomInput) =>
				commandBus.execute<RenameRoomOutput>(new RenameRoomCommand(input)),

			get: (input: GetRoomInput) =>
				queryBus.execute<GetRoomOutput, never>(new GetRoomQuery(input)),

			all: (input: GetRoomsInput) =>
				queryBus.execute<GetRoomsOutput, never, GetRoomsMetadata>(
					new GetRoomsQuery(input),
				),
		},

		turns: {
			abort: (input: AbortTurnInput) =>
				commandBus.execute<AbortTurnOutput>(new AbortTurnCommand(input)),

			acceptProposal: (input: AcceptProposalInput) =>
				commandBus.execute<AcceptProposalOutput>(
					new AcceptProposalCommand(input),
				),

			initiate: (input: InitiateTurnInput) =>
				commandBus.execute<InitiateTurnOutput>(new InitiateTurnCommand(input)),

			retry: (input: RetryTurnInput) =>
				commandBus.execute<RetryTurnOutput>(new RetryTurnCommand(input)),

			get: (input: GetTurnInput) =>
				queryBus.execute<GetTurnOutput, never>(new GetTurnQuery(input)),

			proposals: (input: GetProposalsInput) =>
				queryBus.execute<GetProposalsOutput, never>(
					new GetProposalsQuery(input),
				),
		},
	} as const;
}

export type BriomFacade = ReturnType<typeof facadeBriom>;
