import { type IResult, ValueObject, validator as v } from "@drimion";

import { NegativeCreditError } from "./errors/negative-credit.error";

interface BriomCreditProps {
	/**
	 * @description
	 * BCr available to spend. Cannot go below zero.
	 */
	balance: number;
}

/**
 * @description
 * A Moderator's current Briom Credit balance.
 *
 * BCr is the single currency for all usage in Briom.
 * Free models cost 0 BCr, so this balance stays at 0.
 */
export class BriomCredit extends ValueObject<BriomCreditProps> {
	private constructor(props: BriomCreditProps) {
		super(props);
	}

	public static override isValidProps(
		props: BriomCreditProps,
	): NegativeCreditError | undefined {
		if (v.number(props.balance).isNegative()) return new NegativeCreditError();
	}

	/**
	 * @description
	 * Opens up a new credit with starting balance for every new Moderator.
	 */
	public static initial(): BriomCredit {
		return new BriomCredit({ balance: 0 });
	}

	/**
	 * @description
	 * BCr available to spend. Cannot go below zero.
	 */
	public get balance(): number {
		return this.get("balance");
	}

	/**
	 * @description
	 * Returns true if the balance can cover `amount`.
	 * Always true when amount is 0.
	 */
	public canDeduct(amount: number): boolean {
		return this.balance >= amount;
	}

	/**
	 * @description
	 * Returns a new BriomCredit with `amount` subtracted.
	 *
	 * Caller must verify `canDeduct()` first,
	 * or handle `NegativeCreditError`.
	 */
	public deduct(amount: number): IResult<BriomCredit, NegativeCreditError> {
		return BriomCredit.create({ balance: this.balance - amount });
	}

	/**
	 * @description
	 * Returns a new BriomCredit with `amount` added.
	 */
	public topUp(amount: number): IResult<BriomCredit, NegativeCreditError> {
		return BriomCredit.create({ balance: this.balance + amount });
	}
}
