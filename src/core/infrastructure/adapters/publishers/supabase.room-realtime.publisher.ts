import type { ILogger, IRoomRealtimePublisher } from "@briom/core/app";
import type { SupabaseServiceClient } from "@briom/supabase/client";

export class SupabaseRoomRealtimePublisher implements IRoomRealtimePublisher {
	public constructor(
		private readonly client: SupabaseServiceClient,
		private readonly logger: ILogger,
	) {}

	public async broadcast(
		channel: string,
		event: string,
		payload: Record<string, unknown>,
	): Promise<void> {
		const realtimeChannel = this.client.channel(channel, {
			config: { private: true },
		});

		try {
			await new Promise<void>((resolve, reject) => {
				realtimeChannel.subscribe((status) => {
					if (status === "SUBSCRIBED") resolve();
					if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
						reject(
							new Error(`Realtime channel "${channel}" failed: ${status}`),
						);
					}
				});
			});

			await realtimeChannel.send({ type: "broadcast", event, payload });
		} catch (err) {
			this.logger.warn(
				`[realtime] Failed to broadcast "${event}" on "${channel}"`,
				{ error: err },
			);
		} finally {
			await this.client.removeChannel(realtimeChannel);
		}
	}
}
