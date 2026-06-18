import type { Participant } from "../../room";
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

export class TranscriptorRenderer {
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
						content: `[Unknown]:\n${turn.currentContent}`,
					};
				}

				const speaker = participantMap.get(participantId.value());

				return {
					role: Role.ASSISTANT,
					content: `[${speaker?.get("displayName") || "Unknown"}]:\n${turn.currentContent}`,
				};
			});

		return messages;
	}
}
