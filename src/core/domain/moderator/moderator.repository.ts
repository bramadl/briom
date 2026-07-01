import type { Moderator } from "./moderator";
import type { ModeratorId } from "./moderator.id";

/**
 * @description
 * Persistence contract for the Moderator aggregate.
 *
 * The infrastructure implementation is responsible for
 * reconstituting a fully-hydrated Moderator — including
 * credit balance — via `Moderator.init()`.
 */
export interface IModeratorRepository {
	/**
	 * @description
	 * Returns the Moderator with the given email,
	 * or null if not registered.
	 */
	findByEmail(email: string): Promise<Moderator | null>;

	/**
	 * @description
	 * Returns the Moderator with the given ID,
	 * or null if not registered.
	 */
	findById(id: ModeratorId): Promise<Moderator | null>;

	/**
	 * @description
	 * Persists the Moderator aggregate.
	 *
	 * Idempotent — safe to call on both first
	 * registration and subsequent updates.
	 */
	persist(moderator: Moderator): Promise<void>;
}
