import type { TurnIntent } from "../turn.intent";

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
 * Shared directive appended to every participant prompt, regardless of
 * framing mode. Exists once here rather than duplicated per-intent so it
 * can't drift out of sync with INSTRUCTIONS.
 *
 * Specifically closes the gap where an instruction asks the model to
 * "say plainly" that it found no real disagreement/new angle (see
 * INSTRUCTIONS design note) — without this, a model can satisfy that
 * instruction by writing an aside ABOUT its own response ("Note: I didn't
 * find a strong counterpoint here") instead of just giving the honest
 * answer directly, in character. The former is meta-commentary; the
 * latter is the actual content this system is trying to produce.
 */
const ANTI_HEDGE_DIRECTIVE = `If your task calls for stating plainly that you found no real disagreement, no new angle, or nothing to add, say that directly as your response in your own voice — never as a bracketed note, aside, or comment about the fact that you're responding. A short honest response is a complete turn.`;

/**
 * @description
 * Covers free-text moderator requests that assign a specific argumentative
 * role for this turn only (e.g. "make the strongest case against X",
 * "play devil's advocate here"). These arrive as plain USER message content
 * under DIRECT intent — see DeliberationService, which sets DIRECT whenever
 * a Participant is @mentioned — not as a distinct TurnIntent, so nothing in
 * INSTRUCTIONS is aware of them. Without this, a model can technically
 * fulfill the request and then undercut it with a closing disclaimer
 * ("that said, I personally think..."), which defeats the reason the
 * moderator asked for that role in the first place.
 */
const ROLE_COMMITMENT_DIRECTIVE = `If the moderator's message assigns you a specific argumentative role or position for this turn (e.g. arguing a side, playing devil's advocate, steelmanning a view), fully commit to it for the entire response. Do not soften, hedge, or reverse it with a closing disclaimer about your own actual view — a half-committed answer fails the request even if each sentence is individually accurate.`;

/**
 * @description
 * Counters the strongest default pull for most models when handed a
 * document or a substantial idea: falling into "consultant reviewing a
 * proposal" mode — numbered headings, tables, a feature-suggestion
 * listicle — addressed solely to the moderator as if no other participant
 * is in the room. That register is well-represented in training data and
 * wins by default unless explicitly named and blocked. It's a distinct
 * failure from the ones INSTRUCTIONS.ts guards against: a turn can satisfy
 * "point to a specific claim" and still be a structured report that never
 * once addresses another participant by name, which defeats the purpose
 * of a shared room over parallel one-on-one chats.
 */
const CONVERSATIONAL_REGISTER_DIRECTIVE = `Respond the way you would speak in a live discussion, not the way you'd write a report. Avoid numbered headings, bullet-point lists, and tables unless the moderator specifically asked for structured output — a few flowing paragraphs read as genuine participation, a formatted document reads as a canned audit. If another participant has spoken in this room, address something they specifically said, by name, rather than responding only to the moderator as if their contribution didn't happen.`;

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

${ANTI_HEDGE_DIRECTIVE}

${ROLE_COMMITMENT_DIRECTIVE}

${CONVERSATIONAL_REGISTER_DIRECTIVE}

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

${ANTI_HEDGE_DIRECTIVE}

${ROLE_COMMITMENT_DIRECTIVE}

${CONVERSATIONAL_REGISTER_DIRECTIVE}

The discussion is human-moderated. You are reading a live transcript of the ongoing conversation.
Respond naturally as ${displayName} would continue the discussion. Engage with previous reasoning directly.
Never speak for other participants or the user. Never narrate the scene. Only provide your own response.

Note: Do not prefix your response with your name, model name, or any identifier like "[ModelName]:" or similar. Begin your response directly with the content.
    `.trim();
	},
};

/**
 * @description
 * System prompt for lightweight topic extraction from a user's opening
 * message. Deliberately model-agnostic and cheap — this runs as a
 * background job (see GenerateTopicHandler) and should never be the
 * expensive part of a Turn.
 */
export const TopicGenerationPrompt = {
	summarizer: "openrouter/free",
	build(): string {
		return `Summarize the user's message as a concise topic (8-12 words, no punctuation, no explanation). Output ONLY the topic text, nothing else.`;
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
	summarizer: "openrouter/free",
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
