import type {
	DomainEvent,
	EventSubscriber,
	IEventBus as IDrimionEventBus,
} from "@briom/libs/drimion";

/**
 * @description
 * `BriomEventBus` — Infrastructure Event Bus
 *
 * In-process implementation of `IEventBus` for Briom's application layer.
 * Wraps `Drimion`'s `EventBus` with `Briom`-specific error handling:
 * subscriber failures are logged but never thrown (operation must not fail).
 *
 * **Why Wrap Drimion?**
 * `Drimion`'s `EventBus` throws `AggregateError` on subscriber failure. Briom's
 * event bus catches and logs these errors instead, ensuring that a failing
 * SSE subscriber never breaks a successful command execution.
 *
 * **Event Delivery Guarantees**
 * - At-least-once within process (subscribers run synchronously)
 * - No persistence across restarts (in-memory only)
 * - No retry mechanism (MVP scope)
 *
 * **Future Directions**
 * - Redis Streams for cross-process delivery
 * - BullMQ for persistent, retryable queues
 * - Webhook subscribers for external integrations
 *
 * @see EventBus — Drimion base implementation
 * @see IEventBus — domain contract
 */
export class BriomEventBus implements IDrimionEventBus {
	private readonly subscribers = new Map<
		string,
		Array<(event: DomainEvent) => Promise<void> | void>
	>();

	/**
	 * @description
	 * Registers a subscriber for a specific event type.
	 *
	 * Multiple subscribers for the same type are all invoked. Duplicate
	 * function registration is allowed (callers responsible for deduplication).
	 *
	 * @param type - Event type identifier (e.g., "room:deliberation-started")
	 * @param subscriber - Callback to invoke when event is published
	 */
	subscribe<TPayload>(
		type: string,
		subscriber: EventSubscriber<TPayload>,
	): void {
		const list = this.subscribers.get(type) || [];
		list.push(subscriber as EventSubscriber);
		this.subscribers.set(type, list);
	}

	/**
	 * @description
	 * Publishes a single domain event to all matching subscribers.
	 *
	 * Subscriber errors are caught, logged, and collected — but never thrown.
	 * The operation always succeeds from the publisher's perspective.
	 *
	 * @param event - Domain event to publish
	 */
	public async publish(event: DomainEvent): Promise<void> {
		const handlers = this.subscribers.get(event.type) || [];
		const errors: unknown[] = [];

		for (const handler of handlers) {
			try {
				await handler(event);
			} catch (error) {
				errors.push(error);
				console.error(`[IEventBus] Subscriber failed for ${event.type}`, {
					event: event.type,
					error,
				});
			}
		}

		// Log aggregate but never throw — operation must not fail
		if (errors.length > 0) {
			console.error(
				`[IEventBus] ${errors.length} subscriber(s) failed for event "${event.type}"`,
				{ errors },
			);
		}
	}

	/**
	 * @description
	 * Publishes all domain events in order.
	 *
	 * Each event is published independently — failure in one does not
	 * prevent others from publishing.
	 *
	 * @param events - Array of domain events to publish
	 */
	public async publishAll(events: ReadonlyArray<DomainEvent>): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}

	/**
	 * @description
	 * Removes all subscribers for a given event type.
	 *
	 * @param type - Event type to unsubscribe
	 * @returns Number of subscribers removed
	 */
	public unsubscribe(type: string): number {
		const before = this.subscribers.get(type)?.length || 0;
		this.subscribers.delete(type);
		return before;
	}

	/**
	 * @description
	 * Returns the number of subscribers for a given event type.
	 *
	 * @param type - Event type to count
	 * @returns Subscriber count
	 */
	public subscriberCount(type: string): number {
		return this.subscribers.get(type)?.length || 0;
	}

	/**
	 * @description
	 * Removes all subscribers. Useful for test teardown.
	 */
	public clear(): void {
		this.subscribers.clear();
	}
}
