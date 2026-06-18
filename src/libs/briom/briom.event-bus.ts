import type {
	DomainEvent,
	EventSubscriber,
	IEventBus as IDrimionEventBus,
} from "@briom/libs/drimion";

export class IEventBus implements IDrimionEventBus {
	private readonly subscribers = new Map<
		string,
		Array<(event: DomainEvent) => Promise<void> | void>
	>();

	subscribe<TPayload>(
		type: string,
		subscriber: EventSubscriber<TPayload>,
	): void {
		const list = this.subscribers.get(type) || [];
		list.push(subscriber as EventSubscriber);
		this.subscribers.set(type, list);
	}

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

	public async publishAll(events: ReadonlyArray<DomainEvent>): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}

	public unsubscribe(type: string): number {
		const before = this.subscribers.get(type)?.length || 0;
		this.subscribers.delete(type);
		return before;
	}

	public subscriberCount(type: string): number {
		return this.subscribers.get(type)?.length || 0;
	}

	public clear(): void {
		this.subscribers.clear();
	}
}
