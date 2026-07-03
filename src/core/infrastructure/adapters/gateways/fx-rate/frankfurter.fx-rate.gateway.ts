import type { IFxRateGateway } from "@briom/core/app";
import type { DrizzleConn } from "@briom/drizzle/db";

/**
 * @description
 * `IFxRateGateway` implementation backed by the `fx_rates` cache
 * table, populated daily by an Inngest cron job pulling from
 * Frankfurter (free, no API key, ECB-sourced — see
 * `FetchFxRateFn`/`refresh-fx-rates.ts`).
 */
export class FrankfurterFxRateGateway implements IFxRateGateway {
	private static readonly STALE_THRESHOLD_HOURS = 48;

	public constructor(private readonly db: DrizzleConn) {}

	public async convert(from: string, to: string): Promise<number> {
		const row = await this.db.query.fxRatesTable.findFirst({
			where: { fromCurrency: from, toCurrency: to },
			columns: { rate: true, fetchedAt: true },
		});

		if (row && !this.isStale(row.fetchedAt)) return row.rate;
		return this.fallbackRate(from, to);
	}

	private isStale(fetchedAt: Date): boolean {
		const ageHours = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60);
		return ageHours > FrankfurterFxRateGateway.STALE_THRESHOLD_HOURS;
	}

	/**
	 * @description
	 * Env-var-backed fallback for USD->IDR — the only pair Briom
	 * currently needs. Extend this map if more pairs are ever required;
	 * an unconfigured pair with no cached row throws, since silently
	 * returning `1` would corrupt credit deduction math.
	 */
	private fallbackRate(from: string, to: string): number {
		const key = `${from}->${to}`;

		if (key === "USD->IDR") {
			const fallback = Number(process.env.FX_RATE_USD_IDR ?? 16_000);
			if (!Number.isNaN(fallback) && fallback > 0) return fallback;
		}

		throw new Error(
			`No FX rate available for "${key}" — no cached row and no fallback configured`,
		);
	}
}
