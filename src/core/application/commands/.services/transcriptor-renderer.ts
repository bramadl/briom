import {
	type Checkpoint,
	NarrativePrompt,
	type Participant,
	type Turn,
	type TurnIntent,
} from "@briom/core/domain";

import {
	type ContentBlock,
	type Message,
	Role,
} from "../../ports/gateways/llm/llm.ref";

interface RenderInput {
	/**
	 * @description
	 * The latest Checkpoint for this room,
	 * or null if none has been generated yet.
	 */
	latestCheckpoint: Checkpoint | null;

	/**
	 * @description
	 * Every Participant currently in the room — used to resolve display
	 * names for ASSISTANT messages and to build the "others" list in
	 * system prompts.
	 */
	participants: Participant[];

	/**
	 * @description
	 * All settled turns in the room.
	 *
	 * When a checkpoint exists, the renderer filters this
	 * down to only turns after `checkpoint.coverSequences`,
	 * callers do not need to pre-filter.
	 */
	turns: Turn[];
}

interface BuildSystemPromptInput {
	/**
	 * @description
	 * The Participant about to speak — the prompt is built from their
	 * perspective and identity.
	 */
	currentParticipant: Participant;

	/**
	 * @description
	 * Why this Participant is contributing now — passed straight through
	 * to `NarrativePrompt.build`.
	 */
	intent: TurnIntent;

	/**
	 * @description
	 * All Participants in the room, including `currentParticipant` —
	 * filtered down to "everyone else" internally before formatting.
	 */
	participants: Participant[];
}

/**
 * @description
 * Builds LLM inputs (system prompts and message histories) from the
 * deliberation context. Translates Briom's domain model into provider-agnostic
 * `Message` objects.
 *
 * Core Responsibility: transform the shared deliberation context (previous
 * turns, the latest checkpoint if one exists, participant identities, current
 * intent, file attachments) into structured prompts that guide LLM reasoning
 * without leaking the chat paradigm.
 *
 * Checkpoint-aware rendering: when a Checkpoint exists for the room, it is
 * rendered as a single leading message standing in for everything before
 * `checkpoint.coverSequences`. Only turns settled after that point are
 * rendered individually. This keeps every LLM call's payload bounded
 * regardless of how long the deliberation has run. When no checkpoint
 * exists yet, behavior is unchanged — every settled turn is rendered.
 *
 * Attachment rendering:
 * - Text attachments: content is already resolved on the Attachment itself
 *   (parsed client-side before upload) and injected as `<attached name="…">`
 *   blocks appended to the turn text.
 * - Image attachments: forwarded as `image_url` content blocks in a
 *   `ContentBlock[]`. The model must be vision-capable.
 *
 * Provider Agnostic: outputs domain-agnostic `Message` objects. The LLM
 * Gateway adapter handles provider-specific serialization.
 */
export class TranscriptorRenderer {
	/**
	 * @description
	 * Builds a system prompt for a participant turn.
	 */
	public buildSystemPrompt({
		currentParticipant,
		intent,
		participants,
	}: BuildSystemPromptInput): string {
		const others = participants
			.filter((p) => !p.id.isEqual(currentParticipant.id))
			.map((p) => `- ${p.displayName}`)
			.join("\n");

		return NarrativePrompt.build({
			displayName: currentParticipant.displayName,
			others,
			intent,
		});
	}

	/**
	 * @description
	 * Renders the deliberation history as LLM messages.
	 *
	 * When `latestCheckpoint` is present, it becomes the first message
	 * (SYSTEM role, framed as prior context) and only turns after its
	 * `coverSequences` are rendered individually. Otherwise, every settled
	 * turn is rendered — current behavior, unchanged.
	 */
	public render({
		latestCheckpoint,
		participants,
		turns,
	}: RenderInput): Message[] {
		const participantMap = new Map<string, Participant>(
			participants.map((p) => [p.id.value(), p]),
		);

		const settled = turns.filter((t) => !t.isFailed && !t.isPending);
		const relevantTurns = latestCheckpoint
			? settled.filter(
					(t) =>
						t.get("sequence").get("value") > latestCheckpoint.coverSequences,
				)
			: settled;

		const checkpointMessage: Message[] = latestCheckpoint
			? [
					{
						role: Role.SYSTEM,
						content: `[Prior deliberation summary]:\n${latestCheckpoint.content}`,
					},
				]
			: [];

		const turnMessages = relevantTurns.map((turn): Message => {
			if (turn.isFromModerator) return this.buildModeratorMessage(turn);
			return this.buildParticipantMessage(turn, participantMap);
		});

		return [...checkpointMessage, ...turnMessages];
	}

	/**
	 * @description
	 * Builds the ASSISTANT message for a settled participant turn, prefixing
	 * the content with the speaking Participant's display name so the model
	 * reading the history can tell voices apart. Falls back to "Assistant"
	 * if the Participant has since been removed from the room.
	 */
	private buildParticipantMessage(
		turn: Turn,
		participantMap: Map<string, Participant>,
	): Message {
		const participantId = turn.participantId;
		const speakerName = participantId
			? (participantMap.get(participantId.value())?.displayName ?? "Assistant")
			: "Assistant";

		return {
			role: Role.ASSISTANT,
			content: `[${speakerName}]:\n${turn.currentContent}`,
		};
	}

	/**
	 * @description
	 * Builds a USER message for a moderator turn, resolving any attachments.
	 *
	 * - No attachments → plain string content.
	 * - Text-only attachments → plain string with `<attached>` blocks appended.
	 * - At least one image attachment → `ContentBlock[]` with a text block
	 *   (turn text + any `<attached>` text blocks) followed by `image_url` blocks.
	 */
	private buildModeratorMessage(turn: Turn): Message {
		const attachments = turn.get("attachments");
		const baseText = `[User]:\n${turn.currentContent}`;

		if (!attachments || attachments.length === 0) {
			return { role: Role.USER, content: baseText };
		}

		const textAttachments = attachments.filter((a) => a.isText);
		const imageAttachments = attachments.filter((a) => a.isImage);

		const attachedBlocks = textAttachments
			.map((a) => {
				const text = a.content.mediaType === "text" ? a.content.text : "";
				return `<attached name="${a.name}">\n${text}\n</attached>`;
			})
			.join("\n\n");

		const fullText =
			attachedBlocks.length > 0 ? `${baseText}\n\n${attachedBlocks}` : baseText;

		if (imageAttachments.length === 0) {
			return { role: Role.USER, content: fullText };
		}

		const blocks: ContentBlock[] = [
			{ type: "text", text: fullText },
			...imageAttachments.map((a): ContentBlock => {
				const url = a.content.mediaType === "image" ? a.content.base64 : "";
				return { type: "image_url", image_url: { url } };
			}),
		];

		return { role: Role.USER, content: blocks };
	}
}
