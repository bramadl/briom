import type {
	GetModeratorUsageHandler,
	GetModeratorUsageInput,
} from "@briom/app/bak";

/**
 * @description
 * `ModeratorContextDeps` — Dependency Injection Shape
 *
 * All command and query handlers required for room lifecycle operations.
 * Injected via container to enable testability and swappable implementations.
 */
interface ModeratorContextDeps {
	/**
	 * @description
	 * Get usage limit and resets at data for a moderator.
	 */
	usageLimit: GetModeratorUsageHandler;
}

export class ModeratorContext {
	public constructor(private readonly deps: ModeratorContextDeps) {}

	public async usageLimit(input: GetModeratorUsageInput) {
		return this.deps.usageLimit.execute(input);
	}
}
