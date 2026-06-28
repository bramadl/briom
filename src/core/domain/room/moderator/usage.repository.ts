/**
 * @description
 * `IUsageRepository` — Application Port
 *
 * Tracks per-moderator participant turn usage within the current billing period.
 * Resets automatically when a new calendar month is detected.
 *
 * **Why a Port?**
 * Usage tracking is infrastructure (database). The application layer depends
 * on this abstraction so command handlers remain storage-agnostic.
 */
export interface ModeratorUsage {
	count: number;
	periodStart: Date;
}

export interface IUsageRepository {
	/**
	 * @description
	 * Returns current usage for a moderator, or null if no record exists yet.
	 */
	getUsage(moderatorId: string): Promise<ModeratorUsage | null>;

	/**
	 * @description
	 * Increments the turn count for the current period.
	 * Creates the record if it doesn't exist.
	 */
	increment(moderatorId: string): Promise<void>;

	/**
	 * @description
	 * Resets count and sets periodStart to now.
	 * Called when a new month is detected.
	 */
	resetPeriod(moderatorId: string): Promise<void>;
}
