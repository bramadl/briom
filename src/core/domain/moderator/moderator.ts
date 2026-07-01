import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
	validator as v,
} from "@briom/libs/drimion";

import { BriomCredit, InsufficientCreditError } from "./credit";

import {
	InsufficientNameError,
	InvalidAvatarError,
	InvalidEmailError,
} from "./errors";
import { ModeratorRegistered } from "./events";
import type { ModeratorId } from "./moderator.id";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;

interface ModeratorProps {
	/**
	 * @description
	 * Profile picture URL, or null if not set.
	 */
	avatar: string | null;

	/**
	 * @description
	 * Current Briom Credit balance.
	 * Starts at 0; moves when paid models are used.
	 */
	credit: BriomCredit;

	/**
	 * @description
	 * Verified email address. Used for auth and notifications.
	 */
	email: string;

	/**
	 * @description
	 * Stable identity, mapped to the Database auth UID.
	 */
	id: ModeratorId;

	/**
	 * @description
	 * Display name shown across the platform. Minimum 4 characters.
	 */
	name: string;
}

/**
 * @description
 * The central actor of Briom.
 *
 * Without a Moderator there is no room, deliberation, and turns.
 */
export class Moderator extends Aggregate<ModeratorProps> {
	private constructor(props: ModeratorProps) {
		super(props);
	}

	public static override isValidProps(
		props: ModeratorProps,
	): DomainError | undefined {
		const { avatar, email, name } = props;
		if (v.isString(avatar) && !v.string(avatar).match(URL_REGEX)) {
			return new InvalidAvatarError();
		}

		if (!v.string(email).match(EMAIL_REGEX)) return new InvalidEmailError();
		if (v.string(name).hasLengthLessThan(4)) return new InsufficientNameError();
	}

	/**
	 * @description
	 * Register a new moderator.
	 *
	 * Opens up a Briom Credit with initial balance.
	 *
	 * @emits ModeratorRegistered
	 */
	public static register(
		props: Omit<ModeratorProps, "credit">,
	): IResult<Moderator, DomainError> {
		const fullProps: ModeratorProps = {
			...props,
			credit: BriomCredit.initial(),
		};

		const error = Moderator.isValidProps(fullProps);
		if (error) return Result.error(error);

		const moderator = new Moderator(fullProps);
		moderator.emit(
			new ModeratorRegistered(moderator.id.value(), {
				moderatorId: moderator.id,
				occurredAt: new Date(),
			}),
		);

		return Result.success(moderator);
	}

	/**
	 * @description
	 * Profile picture URL, or null if not set.
	 */
	public get avatar(): string | null {
		return this.get("avatar");
	}

	/**
	 * @description
	 * Current Briom Credit balance.
	 * Starts at 0; moves when paid models are used.
	 */
	public get credit(): BriomCredit {
		return this.get("credit");
	}

	/**
	 * @description
	 * Verified email address. Used for auth and notifications.
	 */
	public get email(): string {
		return this.get("email");
	}

	/**
	 * @description
	 * Display name shown across the platform. Minimum 4 characters.
	 */
	public get name(): string {
		return this.get("name");
	}

	/**
	 * @description
	 * Spends BCr from the Moderator's balance.
	 *
	 * Fails if the balance cannot cover the requested amount.
	 * For free models, `amount` is always 0 — this will always succeed.
	 */
	public deductCredit(amount: number): IResult<true, DomainError> {
		if (!this.credit.canDeduct(amount)) {
			return Result.error(new InsufficientCreditError());
		}

		const updated = this.credit.deduct(amount);
		if (updated.isError()) return Result.error(updated.error());
		this.change("credit", updated.value());

		return Result.success(true);
	}

	/**
	 * @description
	 * Adds BCr to the Moderator's balance after a successful top-up.
	 */
	public topUpCredit(amount: number): IResult<true, DomainError> {
		const updated = this.credit.topUp(amount);
		if (updated.isError()) return Result.error(updated.error());

		this.change("credit", updated.value());
		return Result.success(true);
	}
}
