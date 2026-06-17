import { ValueObject } from "@briom/libs/drimion";

import { InvalidTurnIntentError } from "./errors";
import { INTENT_OPTION, type IntentOption } from "./options";

export class TurnIntent extends ValueObject<IntentOption> {
	private constructor(value: IntentOption) {
		super(value);
	}

	public static override isValidProps(
		value: IntentOption,
	): InvalidTurnIntentError | undefined {
		const normalized = value.toLowerCase() as IntentOption;
		if (!Object.values(INTENT_OPTION).includes(normalized)) {
			return new InvalidTurnIntentError(normalized, "unknown intent");
		}
	}

	public static from(value: IntentOption): TurnIntent {
		return new TurnIntent(value);
	}

	public get toChallenge(): boolean {
		return this.get("value") === INTENT_OPTION.CHALLENGE;
	}

	public get toCritique(): boolean {
		return this.get("value") === INTENT_OPTION.CRITIQUE;
	}

	public get toSummarize(): boolean {
		return this.get("value") === INTENT_OPTION.SUMMARIZE;
	}
}
