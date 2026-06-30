/**
 * @description
 * What caused a credit balance to move.
 *
 * - `CREDIT_DEDUCTED`  — a participant turn consumed BCr
 * - `CREDIT_TOPPED_UP` — a Moderator purchased BCr.
 * - `CREDIT_GRANTED`   — BCr was issued by Briom (promo, welcome grant).
 */
export const CreditMovementType = {
	/**
	 * @description
	 * a participant turn consumed BCr.
	 */
	CREDIT_DEDUCTED: "credit_deducted",

	/**
	 * @description
	 * a Moderator purchased BCr.
	 */
	CREDIT_TOPPED_UP: "credit_topped_up",

	/**
	 * @description
	 * BCr was issued by Briom (promo, welcome grant).
	 */
	CREDIT_GRANTED: "credit_granted",
} as const;

export type CreditMovementType =
	(typeof CreditMovementType)[keyof typeof CreditMovementType];
