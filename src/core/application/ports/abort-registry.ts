/**
 * @description
 * `IAbortRegistry` — Application Port
 *
 * Runtime registry mapping active turn IDs to their AbortControllers.
 * Enables cross-cutting cancellation: timeout handlers and moderator abort
 * commands can both signal an in-flight LLM stream without holding a
 * direct reference to the streaming loop.
 *
 * **Why a Port?**
 * AbortControllers are runtime-only objects. The registry is infrastructure
 * (in-memory Map) but the contract belongs in the application layer so
 * that `TurnLifecycleOrchestrator` (application) can abort without
 * coupling to `TurnStreamingService` (also application).
 *
 * **Lifetime**
 * - Registered when `TurnStreamingService.streamAndSettle()` begins
 * - Unregistered in `finally` block when streaming ends (any outcome)
 * - Aborted by `handleTimeout()` or `AbortTurnHandler`
 */
export interface IAbortRegistry {
	/**
	 * @description
	 * Signals abortion for the given turn, then removes it.
	 * No-op if turn not registered or already aborted.
	 */
	abort(turnId: string, reason?: string): void;
	/**
	 * @description
	 * Registers an AbortController for an active turn.
	 */
	register(turnId: string, controller: AbortController): void;

	/**
	 * @description
	 * Removes a turn from the registry without signalling.
	 * Called by cleanup to prevent memory leaks.
	 */
	unregister(turnId: string): void;
}
