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
 * This file has zero server-only dependencies (no `Inngest` client
 * import, no business logic) — safe to import from both the BE
 * publisher/subscriber and the FE `useRealtime` hook.
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
		 * Terminal: turn settled successfully.
		 */
		settled: { schema: staticSchema<{ turnId: string }>() },

		/**
		 * @description
		 * Terminal: turn failed. `errorKind` mirrors `TurnError.kind`.
		 */
		failed: {
			schema: staticSchema<{ turnId: string; errorKind: string }>(),
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
