import { ValueObject } from "@briom/libs/drimion";

import { NegativeSequenceError } from "./errors";

/**
 * @description
 * `TurnSequence` — Value Object
 *
 * Represents the ordinal position of a turn within a room's deliberation.
 * Sequences start at 1 and increment monotonically. Used to maintain strict
 * ordering of contributions for shared context reconstruction.
 *
 * **Why not just a number?**
 * Sequence is a domain concept with its own validation (must be ≥ 1) and
 * generation rules (first, next). Wrapping it as a Value Object prevents
 * invalid sequences and makes ordering logic explicit.
 */
export class TurnSequence extends ValueObject<number> {
	private constructor(value: number) {
		super(value);
	}

	/**
	 * @description
	 * Validates that sequence is positive (≥ 1).
	 */
	public static override isValidProps(
		value: number,
	): NegativeSequenceError | undefined {
		if (value < 1) return new NegativeSequenceError();
	}

	/**
	 * @description
	 * Creates the first sequence in a deliberation.
	 */
	public static first(): TurnSequence {
		return new TurnSequence(1);
	}

	/**
	 * @description
	 * Creates the next sequence after a given one.
	 */
	public static next(previous: TurnSequence): TurnSequence {
		return new TurnSequence(previous.get("value") + 1);
	}

	/**
	 * @description
	 * Rehydrates from a raw number (e.g., from database).
	 */
	public static fromNumber(value: number): TurnSequence {
		return new TurnSequence(value);
	}
}
