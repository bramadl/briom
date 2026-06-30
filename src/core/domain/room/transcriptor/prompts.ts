import type { TurnIntent } from "../turn/turn.intent";

import { INSTRUCTIONS } from "./instructions";

interface ParticipantPromptInput {
	/**
	 * @description
	 * The Participant's human-readable name, as it should appear when the
	 * model refers to itself in the deliberation (e.g. "Claude", "GPT-4o").
	 */
	displayName: string;

	/**
	 * @description
	 * Why this contribution is happening now — shapes which instruction
	 * line from `INSTRUCTIONS` gets woven into the prompt.
	 */
	intent: TurnIntent;

	/**
	 * @description
	 * Pre-formatted list of the other Participants in the room, one per
	 * line, so the model knows who else is in the conversation and never
	 * mistakes itself for them.
	 */
	others: string;
}

/**
 * @description
 * System prompt template for standard LLM interaction.
 *
 * Treats the LLM as a participant in a collaborative discussion room.
 * Emphasizes that the discussion is human-moderated and the participant
 * should never speak for others.
 */
export const BasicPrompt = {
	build({ displayName, intent, others }: ParticipantPromptInput): string {
		return `
You are participating in a collaborative AI discussion room called Briom.

You are: ${displayName}

Other participants in this room:
${others}

Your task: ${INSTRUCTIONS[intent]}

The discussion is human-moderated. Engage naturally with previous reasoning.
Never speak for other participants or the user.
    `.trim();
	},
};

/**
 * @description
 * System prompt template for immersive discussion framing.
 *
 * Frames the LLM as a specific named participant reading a live transcript
 * and responding naturally. Stronger guardrails against meta-commentary or
 * narrating the scene.
 */
export const NarrativePrompt = {
	build({ displayName, intent, others }: ParticipantPromptInput): string {
		return `
You are ${displayName}, participating in a collaborative AI discussion room called Briom.

Other participants in this room:
${others}

Your task: ${INSTRUCTIONS[intent]}

The discussion is human-moderated. You are reading a live transcript of the ongoing conversation.
Respond naturally as ${displayName} would continue the discussion. Engage with previous reasoning directly.
Never speak for other participants or the user. Never narrate the scene. Only provide your own response.

Note: Do not prefix your response with your name, model name, or any identifier like "[ModelName]:" or similar. Begin your response directly with the content.
    `.trim();
	},
};

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export const TopicGenerationPrompt = {
	summarizer: "openrouter/free",
	build(): string {
		return `Summarize the user's message as a concise topic (12-16 words, no punctuation, no explanation). Output ONLY the topic text, nothing else.`;
	},
};

interface CheckpointPromptInput {
	/**
	 * @description
	 * Previous checkpoint's content, if one exists —
	 * must be absorbed, not discarded.
	 */
	previousCheckpoint: string | null;

	/**
	 * @description
	 * The room's topic, for grounding the summary.
	 */
	topic: string;

	/**
	 * @description
	 * Target word count from `CheckpointWordBudgetPolicy.calculate()`.
	 */
	wordBudget: number;
}

/**
 * @description
 * System prompt for checkpoint generation.
 *
 * Unlike participant prompts, this carries no persona — checkpoints are not
 * a contribution to the deliberation, they're an objective compression of it.
 *
 * The model is instructed to synthesize, not append: each checkpoint must
 * absorb the previous one's content plus new turns into a single summary
 * that stays within budget, rather than growing by simple concatenation.
 */
export const CheckpointPrompt = {
	build({
		topic,
		previousCheckpoint,
		wordBudget,
	}: CheckpointPromptInput): string {
		const continuityInstruction = previousCheckpoint
			? `A previous summary already exists below. Synthesize it together with the new turns into ONE updated summary — do not simply append to it. Preserve every distinct point, perspective, and unresolved tension from the previous summary; compress shared or redundant ground instead of dropping earlier content.`
			: `This is the first summary for this deliberation.`;

		return `
You are summarizing a collaborative AI deliberation in Briom on the topic: "${topic}".

${continuityInstruction}

Your summary must:
- Stay within approximately ${wordBudget} words
- Preserve each participant's distinct perspective, not just a generic consensus
- Note points of agreement, disagreement, and any unresolved questions
- Be written as objective narration, not as any single participant's voice
- Contain no preamble, no meta-commentary about being a summary — begin directly with the content

${previousCheckpoint ? `Previous summary:\n${previousCheckpoint}` : ""}
    `.trim();
	},
};
