/**
 * @description
 * Input for `StartDeliberationCommand`.
 */
export interface StartDeliberationInput {
	/**
	 * @description
	 * Room to start deliberation in.
	 */
	roomId: string;
	/**
	 * @description
	 * Topic that defines what is being explored.
	 */
	topic: string;
}

/**
 * @description
 * `StartDeliberationCommand` — Command
 *
 * Intent: Transition a room from `FORMING` to `DELIBERATING` by setting a topic.
 *
 * This is the point of no return: once deliberation starts, participants
 * cannot be added and turns can begin flowing.
 *
 * @see StartDeliberationHandler — for execution logic
 * @see Room.startDeliberation — for domain rules
 */
export class StartDeliberationCommand {
	public constructor(public readonly input: StartDeliberationInput) {}
}
