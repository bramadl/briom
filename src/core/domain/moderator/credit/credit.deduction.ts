/**
 * @description
 * `CreditDeductionPolicy` — Domain Policy
 *
 * Converts raw OpenRouter USD cost into BCr deduction amount.
 * Markup and peg value are Briom's own business rules — owned here,
 * not scattered across application handlers.
 *
 * FX rate is volatile and externally sourced, so it's the only
 * parameter the caller must supply.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainPolicy>
export class CreditDeductionPolicy {
	private static readonly MARKUP = 3;
	private static readonly BCR_PEG_VALUE_IDR = 50;

	public static calculate(costUsd: number, fxRate: number): number {
		const idrCost = costUsd * fxRate * CreditDeductionPolicy.MARKUP;
		return idrCost / CreditDeductionPolicy.BCR_PEG_VALUE_IDR;
	}
}
