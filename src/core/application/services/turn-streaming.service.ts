import type { LlmGateway, RoomId, TurnId } from "@briom/domain";
import { StreamError } from "@briom/domain";
import { DomainError, type IResult, Result } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports/sse-forwarder";

import type { TurnLifecycleOrchestrator } from "./turn-lifecycle.orchestrator";

const BROADCAST_INTERVAL_MS = 30;
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
 * (See original file for full description.)
 *
 * **Abort support**
 * Each call to `streamAndSettle()` registers an `AbortController` in an
 * in-memory map keyed by `turnId`. The `abort(turnId)` method signals that
 * controller, causing the OpenRouter SDK's async-iterable to throw an
 * `AbortError` on the next iteration. The read-loop catch block detects this
 * and fails the turn with `StreamError.aborted()`. The controller is always
 * cleaned up (registered → removed) regardless of outcome.
 *
 * **Why in-memory and not DB-persisted?**
 * AbortControllers are runtime signals — they don't survive process restarts.
 * That's fine: if the server restarts mid-stream the turn will time out via
 * `TurnTimeoutPolicy` and fail that way. The abort feature is a UX shortcut
 * for a healthy, running stream.
 */
export class TurnStreamingService {
	/**
	 * @description
	 * Live registry of AbortControllers, one per actively streaming turn.
	 * Keyed by raw turnId string. Cleaned up immediately after stream ends.
	 */
	private readonly abortControllers = new Map<string, AbortController>();

	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly llmGateway: LlmGateway,
		private readonly sse: ISseForwarder,
	) {}

	/**
	 * @description
	 * Signals the AbortController for a streaming turn, interrupting the LLM
	 * read loop. The streaming loop detects the AbortError and fails the turn
	 * with `StreamError.aborted()`.
	 *
	 * No-op if the turn is not currently streaming (controller already cleaned up).
	 *
	 * @param turnId - The turn to abort
	 */
	public abort(turnId: TurnId): void {
		const controller = this.abortControllers.get(turnId.value());
		if (controller) {
			controller.abort();
		}
	}

	/**
	 * @description
	 * Streams an LLM response into the given turn, with abort support.
	 *
	 * Registers an AbortController for the turn's lifetime. If `abort()` is
	 * called externally, the LLM stream is cancelled and the turn fails with
	 * `StreamError.aborted()`.
	 *
	 * @param input - Turn ID, room ID, prompt/messages, and target model
	 * @returns The full settled content, or the domain error that failed the turn
	 */
	public async streamAndSettle(
		input: StreamTurnInput,
	): Promise<IResult<string, DomainError>> {
		const { turnId, roomId, messages, qualifiedModel, systemPrompt } = input;

		const controller = new AbortController();
		this.abortControllers.set(turnId.value(), controller);

		const cleanup = (): void => {
			this.abortControllers.delete(turnId.value());
		};

		const streamResult = await this.llmGateway.stream({
			messages,
			qualifiedModel,
			systemPrompt,
			signal: controller.signal,
		});

		if (streamResult.isError()) {
			cleanup();
			await this.orchestrator.fail(turnId, streamResult.error());
			return Result.error(streamResult.error().toDomainError());
		}

		const startResult = await this.orchestrator.startStream(turnId);
		if (startResult.isError()) {
			cleanup();
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
				if (controller.signal.aborted) {
					reader.cancel();
					throw new DOMException("Aborted by moderator", "AbortError");
				}

				const { done, value } = await reader.read();
				if (done) break;

				fullContent += value;
				broadcastBuffer += value;
				persistBuffer += value;
			}

			reader.releaseLock();
		} catch (streamError) {
			stopTimers();
			cleanup();

			const isAbort =
				streamError instanceof DOMException &&
				streamError.name === "AbortError";

			const domainError = isAbort
				? StreamError.aborted()
				: StreamError.streamFailure(
						streamError instanceof Error
							? streamError.message
							: "Stream reading failed",
					);

			await this.orchestrator.fail(turnId, domainError);

			return Result.error(
				new DomainError(
					isAbort ? "Stream aborted by moderator" : "Stream reading failed",
					{ context: "TurnStreamingService" },
				),
			);
		}

		stopTimers();
		cleanup();
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
