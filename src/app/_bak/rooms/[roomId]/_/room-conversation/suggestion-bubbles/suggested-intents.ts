import { INTENT } from "@briom/core/domain";

export const SUGGESTED_INTENTS = Object.values(INTENT).filter(
	(val) => val !== INTENT.DIRECT && val !== INTENT.SUMMARIZE,
);
