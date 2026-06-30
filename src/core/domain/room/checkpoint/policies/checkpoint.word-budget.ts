/**
 * @description
 * Determines how large a checkpoint's summary is allowed to be,
 * based on how many compression cycles the room has already gone through.
 *
 * Each checkpoint compresses the previous checkpoint plus new turns
 * into one summary. Left unchecked, a fixed word budget causes compounding
 * information loss — by the 5th checkpoint, content from the room's early
 * turns has been summarized-of-a-summary so many times it becomes unrecognizable.
 *
 * The budget grows exponentially with iteration to counteract this, then
 * plateaus at a cap so checkpoints never become a wall of text on their own.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainPolicy>
export class CheckpointWordBudgetPolicy {
	private static readonly BASE_WORDS = 500;
	private static readonly MAX_WORDS = 4000;

	/**
	 * @description
	 * Returns the target word count for a checkpoint at the given iteration.
	 */
	public static calculate(iteration: number): number {
		const exponential =
			CheckpointWordBudgetPolicy.BASE_WORDS * 2 ** (iteration - 1);

		return Math.min(exponential, CheckpointWordBudgetPolicy.MAX_WORDS);
	}
}
