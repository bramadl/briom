import { type DomainError, Entity, validator as v } from "@briom/libs/drimion";

import type { ModeratorId } from "../../moderator.id";

import type { CreditMovementType } from "./credit-movement.type";
import { EmptyMovementReasonError } from "./errors";

interface CreditMovementProps {
	/**
	 * @description
	 * BCr involved. Positive = added, negative = spent. Always 0 in MVP.
	 */
	amount: number;

	/**
	 * @description
	 * The Moderator whose balance moved.
	 */
	moderatorId: ModeratorId;

	/**
	 * @description
	 * Human-readable context, e.g. "Turn #12 in room abc (gemma-7b-it)".
	 */
	reason: string;

	/**
	 * @description
	 * What triggered the movement.
	 */
	type: CreditMovementType;
}

/**
 * @description
 * An immutable record of a single BCr balance movement.
 *
 * Every deduction, top-up, or grant leaves a CreditMovement behind.
 * These entries are append-only — once written, never changed.
 * In MVP, only deductions are recorded (and they are all zero).
 */
export class CreditMovement extends Entity<CreditMovementProps> {
	private constructor(props: CreditMovementProps) {
		super(props);
	}

	public static override isValidProps(
		props: CreditMovementProps,
	): DomainError | undefined {
		if (v.string(props.reason).isEmpty()) return new EmptyMovementReasonError();
	}

	/**
	 * @description
	 * BCr involved.
	 *
	 * Positive = added, negative = spent.
	 * Always 0 in MVP.
	 */
	public get amount(): number {
		return this.get("amount");
	}

	/**
	 * @description
	 * The Moderator whose balance moved.
	 */
	public get moderatorId(): ModeratorId {
		return this.get("moderatorId");
	}

	/**
	 * @description
	 * Human-readable context.
	 *
	 * e.g. "Turn #12 in room abc (gemma-7b-it)".
	 */
	public get reason(): string {
		return this.get("reason");
	}

	/**
	 * @description
	 * What triggered the movement.
	 */
	public get type(): CreditMovementType {
		return this.get("type");
	}
}
