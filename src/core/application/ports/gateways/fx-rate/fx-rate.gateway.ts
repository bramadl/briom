/**
 * @description
 * Port to a foreign exchange rate source. Used to convert LLM provider
 * costs (reported in USD by OpenRouter) into IDR before Briom Credit
 * deduction, since `CreditDeductionPolicy` operates in IDR.
 *
 * `convert()` is async — implementations are expected to read from a
 * periodically-refreshed cache (see `FxRateGateway`'s own doc comment)
 * rather than calling a live FX API inline. Callers (currently only
 * `StreamTurnHandler.recordCreditMovement`) must `await` this.
 */
export interface IFxRateGateway {
	/**
	 * @description
	 * Returns the multiplier to convert an amount from `from` to `to`
	 * (e.g. `convert("USD", "IDR")` returns how many IDR one USD is worth).
	 */
	convert(from: string, to: string): Promise<number>;
}