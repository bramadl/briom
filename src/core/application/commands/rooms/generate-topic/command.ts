/**
 * @description
 * Input data required to execute the `GenerateTopic` command.
 */
export interface GenerateTopicInput {
	/**
	 * @description
	 * The ID of the room whose topic is being generated.
	 * Format: UUID v4.
	 */
	roomId: string;

	/**
	 * @description
	 * The moderator's first turn content — the seed the LLM
	 * summarizes into a short topic string.
	 */
	seedContent: string;
}

/**
 * @description
 * Output data returned after the `GenerateTopic` command executes successfully.
 */
export interface GenerateTopicOutput {
	/**
	 * @description
	 * The room this topic belongs to.
	 */
	roomId: string;

	/**
	 * @description
	 * The resolved topic — either freshly generated, or the room's
	 * existing topic if one was already set (idempotent no-op).
	 */
	topic: string;
}

/**
 * @description
 * An implicit-command that summarizes a room's seed turn into a short
 * topic string and attaches it to the Room. Enqueued by
 * `SendModeratorTurnHandler` only on a room's first turn — FE should
 * never call this directly.
 */
export class GenerateTopicCommand {
	public constructor(public readonly input: GenerateTopicInput) {}
}
