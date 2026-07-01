/**
 * @description
 * Input for `ResumeDeliberationCommand`.
 */
export interface ResumeDeliberationInput {
	/**
	 * @description
	 * Room to resume.
	 */
	roomId: string;
}

/**
 * @description
 * `ResumeDeliberationCommand` — Command
 *
 * Intent: Continue a deliberation that was previously paused.
 *
 * Restores the room to DELIBERATING status, allowing turn initiation to resume.
 *
 * @see ResumeDeliberationHandler — for execution logic
 * @see Room.resume — for domain rules
 */
export class ResumeDeliberationCommand {
	public constructor(public readonly input: ResumeDeliberationInput) {}
}
