import { type Participant, SynthesisPrompt } from "../../room";
import type { IntentOption, Turn } from "..";

import type { Message } from "./message";
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
 * Builds LLM inputs (system prompts and message histories) from the deliberation
 * context. Translates Briom's domain model into provider-agnostic message formats.
 *
 * **Core Responsibility**
 * Transform the shared deliberation context (previous turns, participant identities,
 * current intent) into structured prompts that guide LLM reasoning without leaking
 * the chat paradigm.
 *
 * **Design Decisions**
 * - `Moderator` turns become `USER` role (they represent human direction)
 * - `Participant` turns become `ASSISTANT` role (they represent AI reasoning)
 * - `System prompt` establishes the collaborative room context and intent instruction
 * - `NarrativePrompt` format treats the LLM as a participant in a live discussion,
 *   not as an assistant responding to a user
 *
 * **Provider Agnostic**
 * This service outputs domain-agnostic Message objects. The LLM Gateway adapter
 * (e.g., OpenRouterLlmGateway) handles provider-specific formatting.
 */
export class TranscriptorRenderer {
	/**
	 * @description
	 * Builds a system prompt for a participant turn.
	 *
	 * Establishes:
	 * - Who the participant is (display name)
	 * - Who else is in the room
	 * - What the participant's task is (intent instruction)
	 * - That the discussion is human-moderated
	 *
	 * @param input - Current participant, intent, and room participants
	 * @returns System prompt string for LLM consumption
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
	 *
	 * Generates a synthesis by:
	 * 1. Loading the room and participant
	 * 2. Fetching all turns in the room
	 * 3. Building a synthesis-specific system prompt
	 * 4. Rendering turn history as LLM messages
	 * 5. Calling the LLM gateway and collecting the full response
	 *
	 * @param input - Current participant
	 * @returns System prompt for LLM consumption
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
	 * Filters out pending and failed turns (they don't contribute to shared context).
	 * Maps moderator turns to `USER` role and participant turns to `ASSISTANT` role.
	 *
	 * @param input - All participants and turns in the room
	 * @returns Array of messages ordered by turn sequence
	 */
	public render({ participants, turns }: RenderInput): Message[] {
		const participantMap = new Map<string, Participant>(
			participants.map((p) => [p.id.value(), p]),
		);

		const messages = turns
			.filter((t) => !t.isFailed && !t.isPending)
			.map((turn): Message => {
				if (turn.isFromModerator) {
					return {
						role: Role.USER,
						content: `[User]:\n${turn.currentContent}`,
					};
				}

				const participantId = turn.participantId;
				if (!participantId) {
					return {
						role: Role.ASSISTANT,
						content: `[Assistant]:\n${turn.currentContent}`,
					};
				}

				const speaker = participantMap.get(participantId.value());
				return {
					role: Role.ASSISTANT,
					content: `[${speaker?.get("displayName") || "Assistant"}]:\n${turn.currentContent}`,
				};
			});

		return messages;
	}
}
