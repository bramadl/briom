import type { LlmGateway, RoomId, TurnId } from "@briom/domain";
import { StreamError } from "@briom/domain";
import { DomainError, type IResult, Result } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports/sse-forwarder";

import type { TurnLifecycleOrchestrator } from "./turn-lifecycle.orchestrator";

/**
 * @description
 * How often raw tokens are pushed to connected clients over SSE.
 *
 * This is the "live" cadence — what the moderator actually sees update
 * on screen. It is intentionally decoupled from persistence: broadcasting
 * is a fire-and-forget concern (if a client misses a tick, the next tick
 * carries the missed text too, since we send the full buffer-since-last-
 * broadcast, not a diff).
 */
const BROADCAST_INTERVAL_MS = 30;

/**
 * @description
 * How often accumulated text is checkpointed to the database via
 * `TurnLifecycleOrchestrator.accumulate()`.
 *
 * This is deliberately much slower than the broadcast cadence. The
 * checkpoint exists purely so a client reconnecting or reloading mid-
 * stream sees recent-ish content instead of nothing — it is NOT the
 * mechanism that drives the live UI (broadcast is). `settle()` always
 * persists the complete, authoritative content once streaming ends, so
 * a slow or skipped checkpoint never causes data loss — at worst a
 * reconnecting client is briefly behind until the next checkpoint or
 * the final settle.
 */
const PERSIST_INTERVAL_MS = 500;

export interface StreamTurnInput {
	messages: Parameters<LlmGateway["stream"]>[0]["messages"];
	qualifiedModel: string;
	roomId: RoomId;
	systemPrompt: string;
	turnId: TurnId;
}

/**
 * @description
 * `TurnStreamingService` — Application Service
 *
 * Owns the full LLM-streaming lifecycle for a turn that has already been
 * initiated: calling the gateway, reading the stream, broadcasting tokens
 * to connected clients in real time, periodically checkpointing progress
 * to the database, and settling or failing the turn when the stream ends.
 *
 * **Why broadcast and persist are decoupled**
 * The previous implementation called `orchestrator.accumulate()` — a full
 * DB read, DB write, and SSE broadcast, all awaited — inside the stream's
 * read loop, on (effectively) every token. That serializes the loop
 * behind a database round-trip *and* a network broadcast round-trip
 * before the next token can even be read from the LLM, which is what
 * produced the stuttering, uneven delivery on the client: chunks arrived
 * in network-latency-sized bursts dictated by our own write path, not by
 * the LLM's actual token cadence.
 *
 * This version separates two concerns that don't need to move at the
 * same speed:
 * - **Live delivery** (`BROADCAST_INTERVAL_MS`): pushes buffered text to
 *   clients via the SSE forwarder directly. Cheap, frequent, no DB.
 * - **Durability** (`PERSIST_INTERVAL_MS`): periodically checkpoints the
 *   accumulated text via the orchestrator (DB persist + domain event),
 *   so a client joining or reconnecting mid-stream isn't looking at a
 *   completely empty turn. Infrequent on purpose.
 *
 * The LLM read loop itself never awaits either path — it only appends to
 * two small in-memory buffers. Both timers drain independently and guard
 * against overlapping runs, so a slow Supabase call on one tick can never
 * back up the read loop or pile up concurrent writes.
 *
 * **What callers still own**
 * This service does NOT validate the turn, the room, the participant, or
 * build the prompt — callers build `StreamTurnInput` themselves and are
 * responsible for everything before and after this call (initiating /
 * resetting the turn, persisting + publishing initiation events). This
 * service's job starts at "call the LLM" and ends at "turn is settled or
 * failed."
 *
 * @see TurnLifecycleOrchestrator — for the durable state-transition
 * methods this service drives (startStream, accumulate, settle, fail)
 * @see ISseForwarder — for the live broadcast path
 */
export class TurnStreamingService {
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly llmGateway: LlmGateway,
		private readonly sse: ISseForwarder,
	) {}

	/**
	 * @description
	 * Streams an LLM response into the given turn, broadcasting live to
	 * clients on a fast interval and checkpointing to the database on a
	 * slower interval, then settles the turn with the full content once
	 * the stream ends.
	 *
	 * On any failure (gateway error, stream-read error, checkpoint error,
	 * settle error), transitions the turn to `FAILED` via the orchestrator
	 * and returns the error — callers don't need to call `orchestrator.fail`
	 * themselves.
	 *
	 * @param input - Turn ID, room ID, prompt/messages, and target model
	 * @returns The full settled content, or the domain error that failed the turn
	 */
	public async streamAndSettle(
		input: StreamTurnInput,
	): Promise<IResult<string, DomainError>> {
		const { turnId, roomId, messages, qualifiedModel, systemPrompt } = input;

		const streamResult = await this.llmGateway.stream({
			messages,
			qualifiedModel,
			systemPrompt,
		});

		if (streamResult.isError()) {
			await this.orchestrator.fail(turnId, streamResult.error());
			return Result.error(streamResult.error().toDomainError());
		}

		const startResult = await this.orchestrator.startStream(turnId);
		if (startResult.isError()) {
			await this.orchestrator.fail(
				turnId,
				StreamError.streamFailure("Failed to start stream"),
			);

			return Result.error(startResult.error());
		}

		const stream = streamResult.value();

		let fullContent = "";
		let broadcastBuffer = "";
		let persistBuffer = "";

		let broadcasting = false;
		let persisting = false;

		const drainBroadcast = async (): Promise<void> => {
			if (broadcasting || broadcastBuffer.length === 0) return;
			broadcasting = true;

			const chunk = broadcastBuffer;
			broadcastBuffer = "";

			try {
				await this.sse.broadcastToRoom(roomId.value(), {
					event: "turn:token",
					data: { turnId: turnId.value(), token: chunk },
				});
			} catch {
			} finally {
				broadcasting = false;
			}
		};

		const drainPersist = async (): Promise<void> => {
			if (persisting || persistBuffer.length === 0) return;
			persisting = true;

			const chunk = persistBuffer;
			persistBuffer = "";

			const result = await this.orchestrator.accumulate(turnId, chunk);
			if (result.isError()) {
				console.error(
					"[TurnStreamingService] Checkpoint persist failed (non-fatal):",
					result.error(),
				);
			}

			persisting = false;
		};

		const broadcastTimer = setInterval(() => {
			void drainBroadcast();
		}, BROADCAST_INTERVAL_MS);

		const persistTimer = setInterval(() => {
			void drainPersist();
		}, PERSIST_INTERVAL_MS);

		const stopTimers = (): void => {
			clearInterval(broadcastTimer);
			clearInterval(persistTimer);
		};

		try {
			const reader = stream.getReader();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				fullContent += value;
				broadcastBuffer += value;
				persistBuffer += value;
			}

			reader.releaseLock();
		} catch (streamError) {
			stopTimers();
			await this.orchestrator.fail(
				turnId,
				StreamError.streamFailure(
					streamError instanceof Error
						? streamError.message
						: "Stream reading failed",
				),
			);

			return Result.error(
				new DomainError("Stream reading failed", {
					context: "TurnStreamingService",
				}),
			);
		}

		stopTimers();
		await drainBroadcast();

		if (fullContent.trim().length === 0) {
			await this.orchestrator.fail(turnId, StreamError.emptyResponse());
			return Result.error(
				new DomainError("Model returned no content", {
					context: "TurnStreamingService",
				}),
			);
		}

		const settleResult = await this.orchestrator.settle(
			turnId,
			fullContent.replace(/^\s*\[[^\]]+\]\s*:?\s*/m, "").trimStart(),
		);

		if (settleResult.isError()) {
			await this.orchestrator.fail(
				turnId,
				StreamError.streamFailure("Settle failed after streaming"),
			);

			return Result.error(settleResult.error());
		}

		return Result.success(fullContent);
	}
}
