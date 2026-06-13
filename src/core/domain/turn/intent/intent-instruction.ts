import { INTENT, type Intent } from "./intent";

export const INTENT_INSTRUCTION: Record<Intent, string> = {
	[INTENT.RESPOND]: "Respond to the discussion naturally.",
	[INTENT.CRITIQUE]:
		"Critically evaluate the most recent reasoning. Identify weaknesses or gaps.",
	[INTENT.SUMMARIZE]:
		"Summarize the discussion so far — agreements, disagreements, and open questions.",
	[INTENT.CHALLENGE]: "Challenge the assumptions made in the discussion.",
	[INTENT.EXPAND]: "Expand on the most recent idea with more depth and nuance.",
};
