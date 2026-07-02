/**
 * @description
 * A single product-analytics event: something a moderator (or, later,
 * any other actor) did, worth counting toward a funnel or replay.
 *
 * Shape is deliberately generic — `name` + `distinctId` + `properties`
 * maps 1:1 onto how PostHog, Mixpanel, and most other providers model
 * a capture() call, so swapping providers later never touches this type.
 */
export interface AnalyticsEvent {
	/**
	 * @description
	 * Who this event is attributed to. For most Briom events this is
	 * the Moderator — the room-owning, credit-holding actor — but kept
	 * as a plain string (not a domain ID type) so this port stays free
	 * of domain-layer imports.
	 */
	distinctId: string;

	/**
	 * @description
	 * Event name, snake_case, past-tense where it reads naturally
	 * (e.g. "room_frozen", "turn_settled", "checkpoint_generated").
	 * Kept as a plain string rather than an enum so new events don't
	 * require touching this contract.
	 */
	name: string;

	/**
	 * @description
	 * When the event occurred. Defaults to "now" if omitted — mainly
	 * useful when forwarding a domain event whose original occurredAt
	 * predates the moment it's translated and sent.
	 */
	occurredAt?: Date;

	/**
	 * @description
	 * Flat, JSON-serializable properties attached to the event. Kept
	 * flat and primitive-only since every analytics provider's ingest
	 * API expects roughly this shape.
	 */
	properties?: Record<string, string | number | boolean | null>;
}
