import type { StreamError } from "@briom/core/domain";
import { realtime, staticSchema } from "inngest";

/**
 * @description
 * Single realtime channel per Room, carrying every Turn lifecycle event
 * as a distinct topic. Keyed by `roomId` — every caller (FE's
 * `RoomDeliberation`, BE's `TurnsEventSubscriber`) already has `roomId`
 * in hand.
 *
 * This file has zero server-only runtime dependencies — safe to import
 * from both the BE publisher/subscriber and the FE `useRealtime` hook.
 */
export const turnChannel = realtime.channel({
	name: ({ roomId }: { roomId: string }) => `turn:${roomId}`,
	topics: {
		/**
		 * @description
		 * A participant turn was initiated (i.e. handed the floor).
		 * Moderator-authored turns are filtered out before this is ever
		 * published — see `TurnsEventSubscriber.onTurnInitiated`.
		 */
		initiated: {
			schema: staticSchema<{ turnId: string; sequence: number }>(),
		},

		/**
		 * @description
		 * The turn's LLM stream has started. FE uses this to flip the turn
		 * into its "live" rendering branch.
		 */
		streamStarted: { schema: staticSchema<{ turnId: string }>() },

		/**
		 * @description
		 * Non-durable, high-frequency (default: every 30ms while
		 * `StreamConsumer`'s broadcast buffer is non-empty). Carries only
		 * the DELTA since the last broadcast — matches the domain event
		 * this mirrors (`TurnTokenAccumulated.token`) — NOT the full
		 * accumulated content. FE appends this to whatever it already has
		 * for this turnId; it does not replace it.
		 *
		 * Sending full content here was tried and reverted: it makes each
		 * publish's payload size (and serialize/transmit cost) grow with
		 * the turn's total length instead of staying constant, which
		 * compounds the longer a turn streams for.
		 */
		tokenAccumulated: {
			schema: staticSchema<{ turnId: string; token: string }>(),
		},

		/**
		 * @description
		 * Terminal: turn settled successfully. Carries the full final
		 * content directly — FE renders the complete text the instant
		 * this message lands, without waiting on the invalidateRoom()
		 * refetch that fires alongside it.
		 */
		settled: { schema: staticSchema<{ turnId: string; content: string }>() },

		/**
		 * @description
		 * Terminal: turn failed. Mirrors `TurnFailedPayload.error` fields
		 * directly, so `TurnFailed` can render immediately off this
		 * message without waiting on the accompanying refetch.
		 */
		failed: {
			schema: staticSchema<{
				turnId: string;
				kind: StreamError;
				message: string;
				isRetryable?: boolean;
				retryAfter?: number;
			}>(),
		},

		/**
		 * @description
		 * Terminal: turn was abandoned (e.g. superseded before it could
		 * run).
		 */
		abandoned: { schema: staticSchema<{ turnId: string }>() },
	},
});
