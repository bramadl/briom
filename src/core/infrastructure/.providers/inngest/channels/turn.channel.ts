import type { StreamError } from "@briom/core/domain";
import { realtime, staticSchema } from "inngest";

/**
 * @description
 * Single realtime channel per Room, carrying every Turn lifecycle event
 * as a distinct topic. Replaces the old Supabase Realtime broadcast on
 * `turn:{moderatorId}:{entity}` string channels — this is keyed by
 * `roomId` instead, since every caller (FE's `RoomDeliberation`, BE's
 * `TurnsEventSubscriber`) already has `roomId` in hand and no longer
 * needs a Room lookup just to resolve a channel name.
 *
 * `tokenAccumulated` is a first-class topic here, unlike the old
 * Supabase broadcaster where it was deliberately never forwarded (each
 * publish would have meant a DB-changefeed-triggered broadcast — too
 * costly at per-token frequency). Inngest Realtime's publish is a plain
 * in-memory WebSocket fan-out, not database-changefeed-driven, so that
 * cost concern does not apply here — see Inngest's own docs, which use
 * exactly this token-streaming shape as their canonical example.
 *
 * This file has zero server-only runtime dependencies (no `Inngest`
 * client import, no business logic) — safe to import from both the BE
 * publisher/subscriber and the FE `useRealtime` hook. The one import
 * from `@briom/core/domain` is `type`-only (a string literal union),
 * erased at compile time — it does not pull any server-only runtime
 * code into the FE bundle.
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
		 * Non-durable, high-frequency. Published once per throttled flush
		 * inside `StreamConsumer.consume()` (same cadence as the DB
		 * persist), not once per raw token from the LLM provider. Carries
		 * the full accumulated content so far, not just the delta — FE
		 * can set state directly with `.data.content` with no local
		 * concatenation needed.
		 */
		tokenAccumulated: {
			schema: staticSchema<{ turnId: string; content: string }>(),
		},

		/**
		 * @description
		 * Terminal: turn settled successfully. Carries the full final
		 * content directly — same reasoning as `failed`'s inline error
		 * detail above: lets FE render the complete text the instant
		 * this message lands, without waiting on the invalidateRoom()
		 * refetch that fires alongside it. Without this, the only
		 * content FE has at this instant is whatever liveContent last
		 * held, which may lag the true final content by one flush cycle
		 * if the tail-buffer tokenAccumulated publish and this settled
		 * publish race each other over the wire.
		 */
		settled: { schema: staticSchema<{ turnId: string; content: string }>() },

		/**
		 * @description
		 * Terminal: turn failed. Mirrors `TurnFailedPayload.error` fields
		 * directly — carrying the full error here (not just `kind`) means
		 * `TurnFailed` can render immediately off this message, without
		 * waiting on the `invalidateRoom()` refetch that also fires
		 * alongside it. The refetch still happens — it's what makes
		 * `useRoom`'s `turn.error` the source of truth once it resolves —
		 * this is purely to close the gap between "failed" and "refetch
		 * settled" so the user isn't staring at a stale "streaming" card
		 * for that window.
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
		 * run). FE treats this the same as a null turn from a direct
		 * fetch — see `use-turn-streaming`'s doc comment.
		 */
		abandoned: { schema: staticSchema<{ turnId: string }>() },
	},
});
