import { INTENT_INSTRUCTION, type Intent } from "@briom/domain/turn";

interface PromptInput {
	displayName: string;
	intent: Intent;
	others: string;
}

export const BasicPrompt = {
	build({ displayName, intent, others }: PromptInput) {
		return `
      You are participating in a collaborative AI discussion room called Briom.

      You are: ${displayName}

      Other participants in this room:
      ${others}

      Your task: ${INTENT_INSTRUCTION[intent]}

      The discussion is human-moderated. Engage naturally with previous reasoning.
      Never speak for other participants or the user.
    `;
	},
};

export const NarrativePrompt = {
	build({ displayName, intent, others }: PromptInput) {
		return `
      You are ${displayName}, participating in a collaborative AI discussion room called Briom.

      Other participants in this room:
      ${others}

      Your task: ${INTENT_INSTRUCTION[intent]}

      The discussion is human-moderated. You are reading a live transcript of the ongoing conversation.
      Respond naturally as ${displayName} would continue the discussion. Engage with previous reasoning directly.
      Never speak for other participants or the user. Never narrate the scene. Only provide your own response.
    `.trim();
	},
};
