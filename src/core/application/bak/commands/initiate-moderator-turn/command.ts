/**
 * @description
 * Input for `InitiateModeratorTurnCommand`.
 */
export interface InitiateModeratorTurnInput {
	/**
	 * @description
	 * File attachments to include with this turn.
	 *
	 * Each entry is a pre-validated attachment descriptor resolved by the
	 * presentation layer after upload to Supabase Storage. The application
	 * layer passes these through to the domain without re-validating MIME
	 * types or sizes — that contract was already enforced at upload time
	 * by `RoomAttachmentPolicy` and `TurnAttachment.create()`.
	 *
	 * Defaults to empty array when omitted.
	 */
	attachments?: AttachmentInput[];
	/**
	 * @description
	 * Correlation id for FE optimistic reconciliation.
	 */
	clientTurnId?: string;
	/**
	 * @description
	 * Moderator's message content (the human contribution).
	 */
	content: string;
	/**
	 * @description
	 * Moderator ID (must match room's moderator).
	 */
	moderatorId: string;
	/**
	 * @description
	 * Room to contribute to.
	 */
	roomId: string;
}

/**
 * @description
 * Attachment descriptor passed from presentation → application → domain.
 *
 * These are raw property bags — not domain objects yet. The handler
 * rehydrates them into `TurnAttachment` value objects.
 */
export interface AttachmentInput {
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}

/**
 * @description
 * Output from `InitiateModeratorTurnCommand`.
 */
export interface InitiateModeratorTurnOutput {
	/**
	 * @description
	 * ID of the created turn.
	 */
	turnId: string;
}

/**
 * @description
 * `InitiateModeratorTurnCommand` — Command
 *
 * Intent: Add a human moderator contribution to the deliberation.
 *
 * Moderator turns are synchronous (no LLM streaming) and immediately settled.
 * They represent human direction, questions, or synthesis requests that guide
 * the AI participants' next contributions.
 *
 * Moderator turns may carry file attachments (text or image). The room's
 * attachment quota is enforced by `Room.registerAttachment()` before the
 * turn is created.
 *
 * @see InitiateModeratorTurnHandler — for execution logic
 * @see Turn.initiateModeratorTurn — for domain factory
 * @see RoomAttachmentPolicy — for per-room quota rules
 */
export class InitiateModeratorTurnCommand {
	public constructor(public readonly input: InitiateModeratorTurnInput) {}
}
