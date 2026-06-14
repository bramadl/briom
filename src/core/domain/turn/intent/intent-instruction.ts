import { INTENT, type Intent } from "./intent";

export const INTENT_INSTRUCTION: Record<Intent, string> = {
	[INTENT.CHALLENGE]:
		"Question or challenge ideas, assumptions, or conclusions within the discussion if relevant.",

	[INTENT.CRITIQUE]:
		"Offer critical perspective on the recent reasoning, including possible weaknesses, assumptions, or tradeoffs.",

	[INTENT.EXPAND]:
		"Expand on ideas from the discussion with additional depth, nuance, or perspective.",

	[INTENT.DIRECT]:
		"Respond naturally to the user's direct instruction within the context of the ongoing discussion.",

	[INTENT.RESPOND]:
		"Continue the discussion naturally based on the current context.",

	[INTENT.SUMMARIZE]:
		"Summarize the discussion so far, including important agreements, disagreements, and unresolved questions.",
};
