import { TurnIntent } from "../turn.intent";

/**
 * @description
 * System prompt instructions per intent.
 *
 * Used by TranscriptorRenderer to build context-aware LLM prompts.
 *
 * DESIGN NOTE — this is Briom's moat, not boilerplate:
 * The default failure mode of multi-LLM deliberation is convergence: models
 * agree with and elaborate on each other rather than genuinely engaging or
 * disagreeing. Left unchecked, a Briom room degrades into N chatbots
 * co-signing the same take in different words — which is worse than a
 * single model, because it *looks* like independent validation while
 * providing none.
 *
 * Every instruction below enforces two things simultaneously:
 *   1. Specificity — the model must point at a concrete turn, claim, or
 *      participant, never argue "in the abstract." Vague engagement is the
 *      easiest way for a model to fake depth, so it's the first thing
 *      closed off.
 *   2. Permission to find nothing — if genuine scrutiny turns up no real
 *      weakness/new angle/disagreement, the model must say so plainly
 *      instead of manufacturing one. A model forced to always produce a
 *      counterpoint will hallucinate one, which is worse than agreement:
 *      it *performs* rigor while being empty.
 *
 * Output-format guardrails (never speak as another participant, never
 * narrate the scene, never prefix with a name) live in prompt.ts at the
 * template level so they apply once, across all intents. Nothing here
 * should ask the model to comment on its own act of responding — these are
 * instructions about what to engage with, not stage directions.
 */
export const INSTRUCTIONS: Record<TurnIntent, string> = {
	[TurnIntent.CHALLENGE]:
		"Challenge the strongest recent claim in this discussion — not a weak or peripheral one. Name the specific " +
		"claim and the specific reason it may not hold: an unstated assumption, a missing counterexample, or a " +
		"consequence its author didn't account for. Do not open with agreement before disagreeing — lead with the " +
		"problem. If genuine scrutiny turns up no real weakness, say so directly and name what you checked, rather " +
		"than manufacturing a token objection.",

	[TurnIntent.CRITIQUE]:
		"Evaluate the reasoning in the recent turns, not just the topic in general. Point to a specific turn and " +
		"identify a specific flaw in it: an unsupported leap, a conflated distinction, or evidence that doesn't " +
		"actually support the conclusion drawn from it. State the flaw before any concession — 'this is solid but' " +
		"buries the critique; the critique is the point of this turn.",

	[TurnIntent.DIRECT]:
		"Answer exactly what the moderator asked. Do not broaden the scope, answer an adjacent question instead, " +
		"or restate context the room already has. If the request is ambiguous, state your interpretation in one " +
		"clause and answer it — don't ask a clarifying question back.",

	[TurnIntent.EXPAND]:
		"Introduce a dimension of this discussion that no one has raised yet — a different angle, a tradeoff, a " +
		"consequence, or a comparable case. This is not a request to restate an existing point in new words or at " +
		"greater length. If you can't identify genuinely new ground after checking what's already been said, say " +
		"that plainly instead of padding an existing point.",

	[TurnIntent.RESPOND]:
		"Engage with what was actually said in the most recent turns, not a generic continuation of the topic. If " +
		"you disagree with a specific point, say so and say why. If you have nothing to add beyond agreement, keep " +
		"your response short — a brief honest response beats a long one manufactured to sound substantive.",

	[TurnIntent.SUMMARIZE]:
		"State where the deliberation actually stands: what's been established, what specific points remain " +
		"contested between which participants, and any question still open. Name real disagreement explicitly — " +
		"flattening it into false consensus makes the summary inaccurate, not diplomatic. Do not introduce new " +
		"arguments; this turn synthesizes, it doesn't advance the debate.",
};
