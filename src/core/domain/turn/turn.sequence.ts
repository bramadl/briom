import { ValueObject } from "@briom/libs/drimion";

import { NegativeSequenceError } from "./errors";

export class TurnSequence extends ValueObject<number> {
	private constructor(value: number) {
		super(value);
	}

	public static override isValidProps(
		value: number,
	): NegativeSequenceError | undefined {
		if (value < 1) return new NegativeSequenceError();
	}

	public static first(): TurnSequence {
		return new TurnSequence(1);
	}

	public static next(previous: TurnSequence): TurnSequence {
		return new TurnSequence(previous.get("value") + 1);
	}
}
