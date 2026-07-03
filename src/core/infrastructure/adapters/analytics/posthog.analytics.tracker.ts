import type { AnalyticsEvent, IAnalyticsTracker } from "@briom/core/app";
import type { PostHogClient } from "@briom/posthog/client";

export class PostHogAnalyticsTracker implements IAnalyticsTracker {
	public constructor(private readonly client: PostHogClient) {}

	public async track(event: AnalyticsEvent): Promise<void> {
		this.client.capture({
			distinctId: event.distinctId,
			event: event.name,
			properties: event.properties,
			timestamp: event.occurredAt,
		});
	}
}
