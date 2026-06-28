import type { IAttachmentStorage } from "@briom/domain/ports/attachment.storage";
import { type Participant, SynthesisPrompt } from "../../room";
import type { IntentOption, Turn } from "..";
import type { ContentBlock, Message } from "./message";
import { NarrativePrompt } from "./prompts";
import { Role } from "./role";

interface RenderInput {
	participants: Participant[];
	turns: Turn[];
}

interface BuildSystemPromptInput {
	currentParticipant: Participant;
	intent: IntentOption;
	participants: Participant[];
}

interface BuildSynthesisPromptInput {
	participant: Participant;
}

/**
 * @description
 * `TranscriptorRenderer` — Domain Service
 *
 * Builds LLM inputs (system prompts and message histories) from the
 * deliberation context. Translates Briom's domain model into provider-agnostic
 * `Message` objects.
 *
 * **Core Responsibility**
 * Transform the shared deliberation context (previous turns, participant
 * identities, current intent, file attachments) into structured prompts that
 * guide LLM reasoning without leaking the chat paradigm.
 *
 * **Design Decisions**
 * - `Moderator` turns → `USER` role (they represent human direction)
 * - `Participant` turns → `ASSISTANT` role (they represent AI reasoning)
 * - `System prompt` establishes the collaborative room context and intent
 * - `NarrativePrompt` treats the LLM as a participant in a live discussion
 *
 * **Attachment rendering**
 * - Text attachments: content is fetched from `IAttachmentStorage` and injected
 *   as `<attached name="…">…</attached>` blocks appended to the turn text.
 *   The message `content` stays a plain `string`.
 * - Image attachments: forwarded as `image_url` content blocks in a
 *   `ContentBlock[]`. The model must be vision-capable.
 *
 * **`render()` is async** because text attachment content is fetched from
 * Storage on demand rather than stored in the DB — keeping turn records lean.
 *
 * **Provider Agnostic**
 * Outputs domain-agnostic `Message` objects. The LLM Gateway adapter
 * (e.g. `OpenRouterLlmGateway`) handles provider-specific serialization.
 */
export class TranscriptorRenderer {
	public constructor(private readonly attachmentStorage: IAttachmentStorage) {}

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
			.filter((p) => !p.id.equal(currentParticipant.id))
			.map((p) => `- ${p.get("displayName")}`)
			.join("\n");

		return NarrativePrompt.build({
			displayName: currentParticipant.get("displayName"),
			others,
			intent,
		});
	}

	/**
	 * @description
	 * Builds a system prompt for synthesis.
	 */
	public buildSynthesisPrompt({
		participant,
	}: BuildSynthesisPromptInput): string {
		return SynthesisPrompt.build(participant);
	}

	/**
	 * @description
	 * Renders the deliberation history as LLM messages.
	 *
	 * Filters out pending and failed turns — they don't contribute to shared
	 * context. Maps moderator turns to `USER` role and participant turns to
	 * `ASSISTANT` role.
	 *
	 * For moderator turns with attachments:
	 * - Text attachments are fetched from Storage and injected inline.
	 * - Image attachments produce a `ContentBlock[]` instead of a plain string.
	 *
	 * @param input - All participants and turns in the room
	 * @returns Ordered array of messages ready for LLM consumption
	 */
	public async render({
		participants,
		turns,
	}: RenderInput): Promise<Message[]> {
		const participantMap = new Map<string, Participant>(
			participants.map((p) => [p.id.value(), p]),
		);

		const settled = turns.filter((t) => !t.isFailed && !t.isPending);
		const messages = await Promise.all(
			settled.map((turn): Promise<Message> => {
				if (turn.isFromModerator) return this.buildModeratorMessage(turn);

				const participantId = turn.participantId;
				if (!participantId) {
					return Promise.resolve({
						role: Role.ASSISTANT,
						content: `[Assistant]:\n${turn.currentContent}`,
					});
				}

				const speaker = participantMap.get(participantId.value());
				return Promise.resolve({
					role: Role.ASSISTANT,
					content: `[${speaker?.get("displayName") || "Assistant"}]:\n${turn.currentContent}`,
				});
			}),
		);

		return messages;
	}

	/**
	 * @description
	 * Builds a `USER` message for a moderator turn, resolving any attachments.
	 *
	 * - No attachments → plain string content (same as before).
	 * - Text-only attachments → plain string with `<attached>` blocks appended.
	 * - At least one image attachment → `ContentBlock[]` with a text block
	 *   (turn text + any `<attached>` text blocks) followed by `image_url` blocks.
	 */
	private async buildModeratorMessage(turn: Turn): Promise<Message> {
		const attachments = turn.get("attachments");
		const baseText = `[User]:\n${turn.currentContent}`;

		if (!attachments || attachments.length === 0) {
			return { role: Role.USER, content: baseText };
		}

		const textAttachments = attachments.filter((a) => a.isText);
		const imageAttachments = attachments.filter((a) => a.isImage);

		const resolvedTextBlocks = await Promise.all(
			textAttachments.map(async (a) => {
				try {
					const content =
						a.textContent ??
						(await this.attachmentStorage.fetchTextContent(a.url));
					return `<attached name="${a.name}">\n${content}\n</attached>`;
				} catch {
					console.warn(
						`[TranscriptorRenderer] Failed to fetch text content for attachment "${a.name}" — skipping.`,
					);
					return null;
				}
			}),
		);

		const attachedBlocks = resolvedTextBlocks
			.filter((b): b is string => b !== null)
			.join("\n\n");

		const fullText =
			attachedBlocks.length > 0 ? `${baseText}\n\n${attachedBlocks}` : baseText;

		if (imageAttachments.length === 0) {
			return { role: Role.USER, content: fullText };
		}

		const blocks: ContentBlock[] = [
			{ type: "text", text: fullText },
			...imageAttachments.map(
				(a): ContentBlock => ({ type: "image_url", image_url: { url: a.url } }),
			),
		];

		return { role: Role.USER, content: blocks };
	}
}
