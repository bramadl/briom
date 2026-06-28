/**
 * @description
 * `TurnLimitPolicy` — Domain Policy
 *
 * Enforces monthly participant turn limits per moderator.
 * Free tier: 200 turns/month.
 *
 * **Why domain, not application?**
 * The limit is a business rule, not infrastructure. Domain layer owns it.
 */
export class TurnLimitPolicy {
	public static readonly FREE_LIMIT = 200;

	public constructor(
		private readonly limit: number = TurnLimitPolicy.FREE_LIMIT,
	) {}

	public get LIMIT(): number {
		return this.limit;
	}

	/**
	 * @description
	 * Returns true if the given count has met or exceeded the limit.
	 */
	public isExceeded(usedThisPeriod: number): boolean {
		return usedThisPeriod >= this.limit;
	}

	/**
	 * @description
	 * Returns true if the period has rolled over to a new calendar month.
	 */
	public isNewPeriod(periodStart: Date, now: Date = new Date()): boolean {
		return (
			now.getFullYear() !== periodStart.getFullYear() ||
			now.getMonth() !== periodStart.getMonth()
		);
	}
}
