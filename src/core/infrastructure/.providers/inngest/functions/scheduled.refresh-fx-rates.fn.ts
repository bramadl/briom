import { db } from "@briom/drizzle/db";
import { fxRatesTable } from "@briom/drizzle/schema";
import { inngest } from "@briom/inngest/client";
import { sql } from "drizzle-orm";
import { cron } from "inngest";

interface FrankfurterResponse {
	amount: number;
	base: string;
	date: string;
	rates: Record<string, number>;
}

const FRANKFURTER_API_URL =
	"https://api.frankfurter.app/latest?from=USD&to=IDR";

/**
 * @description
 * Daily cron job refreshing the `fx_rates` cache table from
 * Frankfurter (https://www.frankfurter.app) — free, no API key
 * required, rates sourced daily from the European Central Bank.
 *
 * Currently only fetches USD->IDR, the only pair `CreditDeductionPolicy`
 * needs. Add more `step.run` calls (or loop over a pairs list) if
 * additional currencies are ever required.
 *
 * Runs at 03:00 UTC daily — after Frankfurter's own daily update
 * (they publish around 16:00 CET on ECB business days), with slack
 * for weekends/holidays where ECB doesn't publish (Frankfurter simply
 * serves the last known rate on those days, so a slightly-off fetch
 * time here is harmless).
 *
 * `FxRateGateway.convert()` has its own 48h staleness fallback, so a
 * missed run (Frankfurter down, deploy issue) degrades gracefully to
 * the `FX_RATE_USD_IDR` env var rather than silently serving a very
 * old rate forever.
 */
export const scheduledRefreshFxRatesFn = inngest.createFunction(
	{
		id: "scheduled:refresh:fx-rates",
		retries: 2,
		triggers: [cron("0 3 * * *")],
	},
	async ({ step }) => {
		const rate = await step.run("fetch-usd-idr", async () => {
			const response = await fetch(FRANKFURTER_API_URL);
			if (!response.ok) {
				throw new Error(
					`Frankfurter request failed: ${response.status} ${response.statusText}`,
				);
			}

			const data = (await response.json()) as FrankfurterResponse;
			const idrRate = data.rates.IDR;

			if (typeof idrRate !== "number" || idrRate <= 0) {
				throw new Error(
					`Frankfurter returned an invalid USD->IDR rate: ${idrRate}`,
				);
			}

			return idrRate;
		});

		await step.run("persist-rate", async () => {
			await db
				.insert(fxRatesTable)
				.values({
					fromCurrency: "USD",
					toCurrency: "IDR",
					rate,
					fetchedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: [fxRatesTable.fromCurrency, fxRatesTable.toCurrency],
					set: {
						rate: sql`EXCLUDED.rate`,
						fetchedAt: sql`EXCLUDED.fetched_at`,
					},
				});
		});

		return { pair: "USD->IDR", rate };
	},
);
