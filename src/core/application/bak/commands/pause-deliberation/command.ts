/**
 * @description
 * Input for `PauseDeliberationCommand`.
 */
export interface PauseDeliberationInput {
	/**
	 * @description
	 * Room to pause.
	 */
	roomId: string;
}

/**
 * @description
 * `PauseDeliberationCommand` — Command
 *
 * Intent: Temporarily halt an active deliberation.
 *
 * The moderator retains control — deliberation can be resumed later.
 * No new turns can be initiated while paused.
 *
 * @see PauseDeliberationHandler — for execution logic
 * @see Room.pause — for domain rules
 */
export class PauseDeliberationCommand {
	public constructor(public readonly input: PauseDeliberationInput) {}
}
