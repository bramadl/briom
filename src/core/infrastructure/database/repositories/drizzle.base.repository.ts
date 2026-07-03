export abstract class DrizzleBaseRepository {
	/**
	 * @description
	 * Utility to omit keys from an object while preserving type safety.
	 * Useful for filtering out fields like 'createdAt' during database upserts.
	 */
	protected without<T extends object, K extends keyof T>(
		obj: T,
		keys: K[],
	): Omit<T, K> {
		const clone = { ...obj };
		for (const key of keys) {
			delete clone[key];
		}
		return clone;
	}
}
