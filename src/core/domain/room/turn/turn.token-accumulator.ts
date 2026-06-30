import type { Turn } from "./turn";

/**
 * @description
 * Reduces a set of turns down to the raw signals checkpoint policies need —
 * total reported usage tokens, and a character-based fallback estimate when
 * usage wasn't reported (common on free-tier models).
 *
 * This is the only place that reaches into Turn internals for this purpose.
 * Everything downstream (CheckpointTriggerPolicy) works with plain numbers.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Domain Policy
export class TurnTokenAccumulator {
	private static readonly CHARS_PER_TOKEN_ESTIMATE = 4;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	public static accumulate(turns: Turn[]): {
		reportedTokens: number;
		estimatedTokens: number;
	} {
		const reportedTokens = turns.reduce(
			(sum, turn) => sum + (turn.get("usage")?.totalTokens ?? 0),
			0,
		);

		const estimatedTokens = turns.reduce(
			(sum, turn) =>
				sum +
				Math.ceil(
					turn.currentContent.length /
						TurnTokenAccumulator.CHARS_PER_TOKEN_ESTIMATE,
				),
			0,
		);

		return { reportedTokens, estimatedTokens };
	}
}
