import type { ModeratorId } from "../../moderator.id";

import type { CreditMovement } from "./credit-movement";

/**
 * @description
 * Persistence contract for the `CreditMovement` audit log.
 *
 * CreditMovements are append-only — once written, never changed.
 * The infrastructure implementation must enforce INSERT-only
 * semantics; no update or delete path should exist.
 */
export interface ICreditMovementRepository {
	/**
	 * @description
	 * Appends a new CreditMovement to the audit log.
	 *
	 * Must never overwrite an existing record — each movement
	 * has a unique ID.
	 */
	append(movement: CreditMovement): Promise<void>;

	/**
	 * @description
	 * Returns all credit movements for the given Moderator,
	 * ordered oldest-first.
	 *
	 * In MVP this is used for debugging only — no UI surface yet.
	 */
	findByModeratorId(moderatorId: ModeratorId): Promise<CreditMovement[]>;
}
