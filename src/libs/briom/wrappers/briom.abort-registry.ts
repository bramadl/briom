import type { IAbortRegistry } from "@briom/app/bak";

/**
 * @description
 * `BriomAbortRegistry` — Application Service
 *
 * In-process implementation of `IAbortRegistry` using a Map.
 * Thread-safe within a single Node.js process (MVP scope).
 *
 * **Memory Safety**
 * - `unregister` is called in `finally` blocks — guaranteed cleanup
 * - `abort` auto-unregisters after signalling to prevent stale entries
 */
export class BriomAbortRegistry implements IAbortRegistry {
	private readonly controllers = new Map<string, AbortController>();

	public register(turnId: string, controller: AbortController): void {
		this.controllers.set(turnId, controller);
	}

	public abort(turnId: string, reason?: string): void {
		const controller = this.controllers.get(turnId);
		if (controller && !controller.signal.aborted) {
			controller.abort(reason ?? "Aborted by registry");
		}
		this.controllers.delete(turnId);
	}

	public unregister(turnId: string): void {
		this.controllers.delete(turnId);
	}
}
