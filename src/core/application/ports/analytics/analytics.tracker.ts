import type { AnalyticsEvent } from "./analytics.event";

/**
 * @description
 * Port to a product analytics provider. Implementations MUST NOT throw
 * — analytics is a non-critical side effect, and a provider outage or
 * network hiccup should never surface as a command failure. Adapters
 * are responsible for catching and (at most) logging their own errors
 * internally.
 */
export interface IAnalyticsTracker {
	/**
	 * @description
	 * Records a single event. Callers should treat this as fire-and-
	 * forget — see the AnalyticsEventSubscriber for how this gets
	 * scheduled outside the critical request path.
	 */
	track(event: AnalyticsEvent): Promise<void>;
}
