import type { TurnId } from "./turn.id";

/**
 * @description
 * Port for signaling and checking abort requests on an in-flight
 * participant turn. Deliberately NOT part of `ITurnRepository` — this
 * is infra-level cross-process signaling (App Layer command → running
 * Inngest job), not aggregate persistence.
 *
 * Also NOT a `TurnProps` field — `TurnState`'s discriminated union has
 * no "aborting" variant; only `ExecuteParticipantTurn` (which owns the
 * loop) is authorized to call `turn.fail(TurnError.aborted())` once it
 * observes this signal.
 */
export interface ITurnAbortSignal {
	/**
	 * @description
	 * Remove flags of requesting for abort on an abort-requested turn.
	 */
	clear(turnId: TurnId): Promise<void>;

	/**
	 * @description
	 * Check wether a turn with the given id was requested to be aborted.
	 */
	isRequested(turnId: TurnId): Promise<boolean>;

	/**
	 * @description
	 * Request a turn to be aborted given the turnId.
	 */
	request(turnId: TurnId): Promise<void>;
}
