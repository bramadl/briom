/**
 * @description
 * Input for `ConcludeDeliberationCommand`.
 */
export interface ConcludeDeliberationInput {
	/**
	 * @description
	 * Room to conclude.
	 */
	roomId: string;
}

/**
 * @description
 * `ConcludeDeliberationCommand` — Command
 *
 * Intent: Permanently end a deliberation.
 *
 * The room transitions to `CONCLUDED` status. No further turns can be initiated.
 * This is the terminal state for a thinking session.
 *
 * @see ConcludeDeliberationHandler — for execution logic
 * @see Room.conclude — for domain rules
 */
export class ConcludeDeliberationCommand {
	public constructor(public readonly input: ConcludeDeliberationInput) {}
}
