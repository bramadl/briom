import * as pg from "drizzle-orm/pg-core";

/**
 * @description
 * Database schema for cached FX conversion rates.
 *
 * Populated by a daily Inngest cron job fetching from Frankfurter
 * (https://www.frankfurter.app — free, no API key, ECB-sourced daily
 * rates). Read synchronously... well, asynchronously — see
 * `FxRateGateway.convert()` — by the application layer whenever a
 * turn settles and its cost needs converting from USD to IDR for BCr
 * deduction.
 *
 * One row per currency pair. Upserted (never inserted-and-forgotten)
 * on each refresh, so this table only ever holds the latest known
 * rate per pair — no historical rate log. If audit history of rate
 * changes becomes necessary later, that's a separate concern from
 * this cache table.
 */
export const fxRatesTable = pg.snakeCase.table(
	"fx_rates",
	{
		/**
		 * @description
		 * Unique row identifier (UUID).
		 */
		id: pg.uuid().primaryKey().defaultRandom(),

		/**
		 * @description
		 * Source currency code, e.g. "USD".
		 */
		fromCurrency: pg.text().notNull(),

		/**
		 * @description
		 * Target currency code, e.g. "IDR".
		 */
		toCurrency: pg.text().notNull(),

		/**
		 * @description
		 * How many units of `toCurrency` one unit of `fromCurrency` is
		 * worth, as of `fetchedAt`.
		 */
		rate: pg.real().notNull(),

		/**
		 * @description
		 * When this rate was last fetched from Frankfurter. Used by
		 * `FxRateGateway` to decide whether a cached rate is stale enough
		 * to fall back to the env var default (see its own doc comment).
		 */
		fetchedAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		pg
			.uniqueIndex("fx_rates_pair_unique")
			.on(table.fromCurrency, table.toCurrency),
	],
);
