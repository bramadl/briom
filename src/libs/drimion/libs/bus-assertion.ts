/**
 * @description
 * Runtime guard to catch "class exists but never registered on a bus"
 * mistakes — exactly the kind of bug where a Command/Query handler is
 * wired in the container but the bus registration line is missing.
 *
 * Usage (typically at the end of busesSlice's registerEvent, after both
 * buses are fully registered):
 *
 * ```ts
 * import * as ApplicationLayer from "@briom/core/application";
 *
 * assertBusFullyRegistered({
 *   bus: r.commandBus,
 *   busName: "commandBus",
 *   module: ApplicationLayer,
 *   suffix: "Command",
 * });
 *
 * assertBusFullyRegistered({
 *   bus: r.queryBus,
 *   busName: "queryBus",
 *   module: ApplicationLayer,
 *   suffix: "Query",
 * });
 * ```
 *
 * This relies on a naming convention: every Command class name ends with
 * "Command" (e.g. `RegisterModeratorCommand`) and every Query class name
 * ends with "Query" (e.g. `GetModeratorQuery`). DTOs, handlers, and
 * anything else exported from the barrel are filtered out because they
 * don't match the suffix, or because they're excluded explicitly below.
 */

// biome-ignore lint/suspicious/noExplicitAny: structural check, type doesn't matter here
type Constructor = new (...args: any[]) => any;

interface BusLike {
	has(CommandOrQueryClass: Constructor): boolean;
}

interface AssertBusFullyRegisteredOptions {
	bus: BusLike;
	busName: string;
	/**
	 * @description
	 * Class names to skip even if they match the suffix — e.g. abstract
	 * base classes, or command/query types that are intentionally never
	 * routed through a bus.
	 */
	exclude?: string[];
	// biome-ignore lint/suspicious/noExplicitAny: barrel module namespace object
	module: Record<string, any>;
	suffix: "Command" | "Query";
	targetFilePath?: string;
}

export function assertBus({
	bus,
	busName,
	module,
	suffix,
	exclude = [],
	targetFilePath = "buses.slice.ts",
}: AssertBusFullyRegisteredOptions): void {
	const excludeSet = new Set(exclude);
	const missing: string[] = [];

	for (const [exportName, exportValue] of Object.entries(module)) {
		if (typeof exportValue !== "function") continue;
		if (!exportName.endsWith(suffix)) continue;
		if (excludeSet.has(exportName)) continue;

		// Handler classes conventionally end with "CommandHandler" /
		// "QueryHandler" — those legitimately end with "Handler", not with
		// the bare "Command"/"Query" suffix, so they're naturally excluded
		// already. This guard is just an extra safety net in case naming
		// drifts (e.g. someone names a handler "...Command" by mistake).
		if (exportName.endsWith(`${suffix}Handler`)) continue;

		// Only classes that look like message DTOs — has a constructor,
		// isn't obviously a handler (handlers are conventionally suffixed
		// "Handler" and excluded above). We don't try to be cleverer than
		// this; the naming convention IS the contract.
		if (!bus.has(exportValue as Constructor)) {
			missing.push(exportName);
		}
	}

	if (missing.length > 0) {
		throw new Error(
			`[Container] ${busName} is missing registration for: ${missing.join(", ")}. ` +
				`Each exported "*${suffix}" class must be registered via ${busName}.register(...) in ${targetFilePath}.`,
		);
	}
}
