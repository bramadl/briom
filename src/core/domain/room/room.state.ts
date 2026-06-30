import { type DomainError, ValueObject } from "@briom/libs/drimion";

type RoomStateKind = "frozen" | "locked";

interface RoomStateProps {
	/**
	 * @description
	 * - "frozen" — temporary, self-resolvable by the moderator (e.g. top up
	 * credits, wait for monthly reset).
	 *
	 * - "locked" — requires admin
	 * intervention (e.g. moderation action), cannot be self-resolved.
	 */
	kind: RoomStateKind;

	/**
	 * @description
	 * When this state change occurred.
	 */
	occurredAt: Date;

	/**
	 * @description
	 * Human-readable explanation shown to the moderator in the UI.
	 * e.g. "You've used 100% of your daily limit, top up Briom Credit
	 * now to continue deliberating or wait for the next reset."
	 */
	reason: string;
}

/**
 * @description
 * `RoomState` — Value Object
 *
 * Captures why a Room stopped accepting new turns, independent of the
 * Room's lifecycle status. A Room can be DELIBERATING and locked at the
 * same time — locking gates turn acceptance, it does not change where
 * the Room sits in its FORMING → DELIBERATING → CONCLUDED lifecycle.
 *
 * `kind` distinguishes two fundamentally different situations:
 * - "frozen": the moderator caused this and can resolve it themselves
 *   (e.g. hit a free-tier checkpoint depth, ran out of credits).
 * - "locked": an admin/moderation action caused this; only an admin
 *   can lift it.
 *
 * This distinction drives FE behavior directly — `isSelfResolvable`
 * decides whether to show a "top up" call-to-action or a static notice.
 */
export class RoomState extends ValueObject<RoomStateProps> {
	private constructor(props: RoomStateProps) {
		super(props);
	}

	public static override isValidProps(
		_props: RoomStateProps,
	): DomainError | undefined {
		// No structural invariant beyond what the type system already
		// enforces — `kind` is a closed union and `reason`/`occurredAt`
		// are always supplied by the static factories below.
		return undefined;
	}

	/**
	 * @description
	 * Creates a self-resolvable freeze — typically triggered by reaching
	 * a free-tier checkpoint depth or exhausting available credits.
	 */
	public static frozen(reason: string): RoomState {
		return new RoomState({ kind: "frozen", reason, occurredAt: new Date() });
	}

	/**
	 * @description
	 * Creates an admin-only lock — typically triggered by a moderation
	 * action (e.g. policy violation). Cannot be resolved by the moderator.
	 */
	public static locked(reason: string): RoomState {
		return new RoomState({ kind: "locked", reason, occurredAt: new Date() });
	}

	/**
	 * @description
	 * "frozen" or "locked" — drives whether this lock can be
	 * self-resolved by the moderator.
	 */
	public get kind(): RoomStateKind {
		return this.get("kind");
	}

	/**
	 * @description
	 * When this state changes was occurred.
	 */
	public get occurredAt(): Date {
		return this.get("occurredAt");
	}

	/**
	 * @description
	 * Human-readable explanation shown to the moderator in the UI.
	 */
	public get reason(): string {
		return this.get("reason");
	}

	/**
	 * @description
	 * True if the moderator themselves can resolve this lock
	 * (e.g. by topping up credits or waiting for a reset).
	 * False for moderation locks, which require admin intervention.
	 */
	public get isSelfResolvable(): boolean {
		return this.get("kind") === "frozen";
	}
}
