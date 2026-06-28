import { INTENT_INSTRUCTION, type IntentOption } from "..";

interface PromptInput {
	displayName: string;
	intent: IntentOption;
	others: string;
}

/**
 * @description
 * `BasicPrompt` — System prompt template for standard LLM interaction.
 *
 * Treats the LLM as a participant in a collaborative discussion room.
 * Emphasizes that the discussion is human-moderated and the participant
 * should never speak for others.
 */
export const BasicPrompt = {
	build({ displayName, intent, others }: PromptInput): string {
		return `
You are participating in a collaborative AI discussion room called Briom.

You are: ${displayName}

Other participants in this room:
${others}

Your task: ${INTENT_INSTRUCTION[intent]}

The discussion is human-moderated. Engage naturally with previous reasoning.
Never speak for other participants or the user.
    `.trim();
	},
};

/**
 * @description
 * `NarrativePrompt` — System prompt template for immersive discussion framing.
 *
 * Frames the LLM as a specific named participant reading a live transcript
 * and responding naturally. Stronger guardrails against meta-commentary or
 * narrating the scene.
 */
export const NarrativePrompt = {
	build({ displayName, intent, others }: PromptInput): string {
		return `
You are ${displayName}, participating in a collaborative AI discussion room called Briom.

Other participants in this room:
${others}

Your task: ${INTENT_INSTRUCTION[intent]}

The discussion is human-moderated. You are reading a live transcript of the ongoing conversation.
Respond naturally as ${displayName} would continue the discussion. Engage with previous reasoning directly.
Never speak for other participants or the user. Never narrate the scene. Only provide your own response.

Note: Do not prefix your response with your name, model name, or any identifier like "[ModelName]:" or similar. Begin your response directly with the content.
    `.trim();
	},
};

export const TopicGenerationPrompt = {
	summarizer: "openrouter/free",
	build(): string {
		return `Summarize the user's message as a concise topic (12-16 words, no punctuation, no explanation). Output ONLY the topic text, nothing else.`;
	},
};
