/**
 * @description
 * Decides whether enough deliberation has accumulated
 * since the last checkpoint to justify generating a new one.
 *
 * Zero dependencies on Turn or any other aggregate —
 * the caller is responsible for reducing turn history down to
 * these two numbers first (see TurnTokenAccumulator).
 *
 * This keeps the policy pure and testable with plain numbers.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainPolicy>
export class CheckpointTriggerPolicy {
	private static readonly TOKEN_THRESHOLD = 24_000;
	private static readonly ESTIMATED_TOKEN_THRESHOLD = 24_000;

	/**
	 * @description
	 * Returns true if `turnsSinceLastCheckpoint` is heavy enough to warrant
	 * generating a new checkpoint.
	 *
	 * @param reportedTokens
	 * Sum of LLMUsage.totalTokens across turns since the last checkpoint.
	 * Zero if no turn reported usage.
	 *
	 * @param estimatedTokens
	 * Character-based fallback estimate, used only when reportedTokens is zero.
	 */
	public static shouldGenerate(
		reportedTokens: number,
		estimatedTokens: number,
	): boolean {
		if (reportedTokens > 0) {
			return reportedTokens > CheckpointTriggerPolicy.TOKEN_THRESHOLD;
		}

		return estimatedTokens > CheckpointTriggerPolicy.ESTIMATED_TOKEN_THRESHOLD;
	}
}
