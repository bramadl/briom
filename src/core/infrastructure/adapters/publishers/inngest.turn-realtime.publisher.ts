import type { ITurnRealtimePublisher } from "@briom/core/app";
import type { StreamError } from "@briom/core/domain";
import { turnChannel } from "@briom/inngest/channels/turn.channel";
import type { InngestClient } from "@briom/inngest/client";

/**
 * @description
 * `ITurnRealtimePublisher` implementation backed by Inngest Realtime.
 * Uses `inngest.realtime.publish()` (the client-level alias), not
 * `step.realtime.publish()` — this class is called from
 * `TurnsEventSubscriber` and from `StreamConsumer` (inside
 * `StreamTurnHandler`'s execution, not a `step.run()` block), so there
 * is no step context to durably attach a publish to. Every publish
 * here is non-durable by necessity, not just by choice.
 */
export class InngestTurnRealtimePublisher implements ITurnRealtimePublisher {
	public constructor(private readonly client: InngestClient) {}

	public async publishInitiated(
		roomId: string,
		data: { turnId: string; sequence: number },
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.initiated, data);
	}

	public async publishStreamStarted(
		roomId: string,
		data: { turnId: string },
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.streamStarted, data);
	}

	public async publishTokenAccumulated(
		roomId: string,
		data: { turnId: string; token: string },
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.tokenAccumulated, data);
	}

	public async publishSettled(
		roomId: string,
		data: { turnId: string; content: string },
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.settled, data);
	}

	public async publishFailed(
		roomId: string,
		data: {
			turnId: string;
			kind: StreamError;
			message: string;
			isRetryable?: boolean;
			retryAfter?: number;
		},
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.failed, data);
	}

	public async publishAbandoned(
		roomId: string,
		data: { turnId: string },
	): Promise<void> {
		const channel = turnChannel({ roomId });
		await this.client.realtime.publish(channel.abandoned, data);
	}
}
