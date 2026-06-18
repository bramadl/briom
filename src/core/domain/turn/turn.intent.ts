import { ValueObject } from "@briom/libs/drimion";

import { InvalidTurnIntentError } from "./errors";
import { INTENT_OPTION, type IntentOption } from "./options";

/**
 * @description
 * `TurnIntent` — Value Object
 *
 * Represents the purpose of a participant turn: why this participant is speaking
 * now within the deliberation context. The intent shapes the system prompt given
 * to the LLM and guides the nature of the perspective generated.
 *
 * **Ubiquitous Language**
 * - `Intent`: purpose dari turn (NOT "action", "command", "type")
 * - `RESPOND`: Continue the discussion naturally
 * - `CRITIQUE`: Offer critical perspective on recent reasoning
 * - `EXPAND`: Add depth or nuance to the discussion
 * - `CHALLENGE`: Question assumptions or conclusions
 * - `SUMMARIZE`: Synthesize where the deliberation stands
 * - `DIRECT`: Respond directly to the moderator's request
 *
 * **Why Intent Matters**
 * Without intent, participant turns become generic LLM responses. Intent ensures
 * each turn has a deliberate role in evolving the deliberation, creating contrast,
 * tension, and synthesis — the core value of multi-perspective thinking.
 */
export class TurnIntent extends ValueObject<IntentOption> {
	private constructor(value: IntentOption) {
		super(value);
	}

	/**
	 * @description
	 * Validates that the intent string matches a known `INTENT_OPTION` value.
	 */
	public static override isValidProps(
		value: IntentOption,
	): InvalidTurnIntentError | undefined {
		const normalized = value.toLowerCase() as IntentOption;
		if (!Object.values(INTENT_OPTION).includes(normalized)) {
			return new InvalidTurnIntentError(normalized, "unknown intent");
		}
	}

	/**
	 * @description
	 * Factory from a known intent option.
	 */
	public static from(value: IntentOption): TurnIntent {
		return new TurnIntent(value);
	}

	/**
	 * @description
	 * Whether this intent is `CHALLENGE`.
	 */
	public get toChallenge(): boolean {
		return this.get("value") === INTENT_OPTION.CHALLENGE;
	}

	/**
	 * @description
	 * Whether this intent is `CRITIQUE`.
	 */
	public get toCritique(): boolean {
		return this.get("value") === INTENT_OPTION.CRITIQUE;
	}

	/**
	 * @description
	 * Whether this intent is `SUMMARIZE`.
	 */
	public get toSummarize(): boolean {
		return this.get("value") === INTENT_OPTION.SUMMARIZE;
	}
}
