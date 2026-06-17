import { type Participant, ParticipantRole } from "@briom/domain/participant";
import type { Intent, Turn, TurnAuthorAsParticipant } from "@briom/domain/turn";

import type { Message } from "./message";
import { NarrativePrompt } from "./prompts";

interface RenderInput {
	participants: Participant[];
	turns: Turn[];
}

interface BuildSystemPromptInput {
	currentParticipant: Participant;
	intent: Intent;
	participants: Participant[];
}

export class Transcriptor {
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
				if (turn.isFromUser) {
					return {
						role: ParticipantRole.USER,
						content: `[User]:\n${turn.get("content")}`,
					};
				}

				const author = turn.get("author") as TurnAuthorAsParticipant;
				const speaker = participantMap.get(
					author.participantId as string,
				) as Participant;

				return {
					role: ParticipantRole.ASSISTANT,
					content: `[${speaker.get("displayName")}]:\n${turn.get("content")}`,
				};
			});

		return messages;
	}
}
