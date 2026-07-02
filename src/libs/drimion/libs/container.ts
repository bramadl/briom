/**
 * @drimion/container
 *
 * A lightweight, type-safe, fluent dependency wiring system.
 * No libraries. No decorators. No proxies. Pure TypeScript.
 */

// biome-ignore lint/suspicious/noExplicitAny: intentional structural wildcard
type AnyTokenMap = Record<string, any>;

type Resolved<Reg extends AnyTokenMap> = {
	[K in keyof Reg]: ReturnType<Reg[K]>;
};

type Factory<Reg extends AnyTokenMap, T> = (resolved: Resolved<Reg>) => T;

export class ContainerBuilder<
	Reg extends Record<string, (resolved: AnyTokenMap) => unknown> = Record<
		never,
		never
	>,
> {
	private constructor(
		private readonly _entries: Array<{
			token: string;
			factory: (resolved: AnyTokenMap) => unknown;
		}>,
		private readonly _eventHooks: Array<(resolved: AnyTokenMap) => void> = [],
	) {}

	static create(): ContainerBuilder<Record<never, never>> {
		return new ContainerBuilder([], []);
	}

	/**
	 * @description
	 * Register a dependency with eager resolution (default).
	 */
	add<K extends string, T>(
		token: K,
		factory: Factory<Reg, T>,
	): ContainerBuilder<Reg & Record<K, (resolved: AnyTokenMap) => T>> {
		return new ContainerBuilder<Reg & Record<K, (resolved: AnyTokenMap) => T>>(
			[...this._entries, { factory: factory as (r: AnyTokenMap) => T, token }],
			this._eventHooks,
		);
	}

	/**
	 * @description
	 * Compose with another builder. The other builder's entries are appended.
	 * Both builders must be unbuilt (blueprint mode).
	 */
	extend<Ext extends Record<string, (resolved: AnyTokenMap) => unknown>>(
		other: ContainerBuilder<Ext>,
	): ContainerBuilder<Reg & Ext> {
		return new ContainerBuilder<Reg & Ext>(
			[...this._entries, ...other._entries],
			[...this._eventHooks, ...other._eventHooks],
		);
	}

	/**
	 * @description
	 * Merge a fully-resolved container into this builder.
	 * All keys from the external container become available as factories
	 * that return the already-resolved values (singleton behavior).
	 */
	from<Ext extends AnyTokenMap>(
		external: Ext,
	): ContainerBuilder<Reg & { [K in keyof Ext]: () => Ext[K] }> {
		const externalEntries = Object.entries(external).map(([token, value]) => ({
			factory: () => value,
			token,
		}));

		return new ContainerBuilder(
			[...this._entries, ...externalEntries],
			this._eventHooks,
		);
	}

	/**
	 * @description
	 * Register an event hook that runs after build(), receiving the fully
	 * resolved container. Useful for wiring event subscribers.
	 */
	registerEvent(
		hook: (resolved: Resolved<Reg>) => void,
	): ContainerBuilder<Reg> {
		return new ContainerBuilder<Reg>(this._entries, [
			...this._eventHooks,
			hook as (r: AnyTokenMap) => void,
		]);
	}

	/**
	 * @description
	 * Resolve all registered factories in registration order.
	 * Throws if a token is duplicated or a factory throws.
	 */
	build(): Resolved<Reg> {
		const resolved: AnyTokenMap = {};

		for (const { token, factory } of this._entries) {
			if (token in resolved) {
				throw new Error(
					`[Container] Duplicate token "${String(token)}". Each token must be registered exactly once.`,
				);
			}
			try {
				resolved[token] = factory(resolved);
			} catch (err) {
				throw new Error(
					`[Container] Failed to resolve token "${String(token)}": ${(err as Error).message}`,
					{ cause: err },
				);
			}
		}

		const frozen = Object.freeze(resolved) as Resolved<Reg>;

		for (const hook of this._eventHooks) {
			hook(frozen);
		}

		return frozen;
	}
}
