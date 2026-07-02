/**
 * @description
 * Port to a foreign exchange rate source. Used to convert LLM provider
 * costs (reported in USD by OpenRouter) into IDR before Briom Credit
 * deduction, since `CreditDeductionPolicy` operates in IDR.
 */
export interface IFxRateGateway {
	/**
	 * @description
	 * Returns the multiplier to convert an amount from `from` to `to`
	 * (e.g. `convert("USD", "IDR")` returns how many IDR one USD is worth).
	 */
	convert(from: string, to: string): number;
}
