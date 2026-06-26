import type { LlmGateway, RoomId, TurnId } from "@briom/domain";
import { StreamError } from "@briom/domain";
import { DomainError, type IResult, Result } from "@briom/libs/drimion";

import type { IAbortRegistry } from "../ports";
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
 * Manages the LLM streaming lifecycle for a single turn: connection,
 * token accumulation, broadcast, persistence, and settlement.
 *
 * **Abort Support**
 * Each `streamAndSettle()` call registers its `AbortController` with the
 * injected `IAbortRegistry`. External callers (timeout handler, moderator
 * abort command) signal abortion via the registry. The streaming loop
 * detects `AbortError` and fails the turn gracefully.
 *
 * **Cleanup Guarantee**
 * `unregister()` is called in a `finally` block — regardless of success,
 * failure, or abortion — preventing memory leaks.
 */
export class TurnStreamingService {
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly llmGateway: LlmGateway,
		private readonly sse: ISseForwarder,
		private readonly abortRegistry: IAbortRegistry,
	) {}

	/**
	 * @description
	 * Signals abortion for a streaming turn via the registry.
	 * No-op if turn is not currently streaming.
	 */
	public abort(turnId: TurnId): void {
		this.abortRegistry.abort(turnId.value(), "Aborted by moderator");
	}

	/**
	 * @description
	 * Streams an LLM response into the given turn with full abort support.
	 */
	public async streamAndSettle(
		input: StreamTurnInput,
	): Promise<IResult<string, DomainError>> {
		const { turnId, roomId, messages, qualifiedModel, systemPrompt } = input;

		const controller = new AbortController();
		this.abortRegistry.register(turnId.value(), controller);

		const cleanup = (): void => {
			this.abortRegistry.unregister(turnId.value());
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
				// Non-fatal: SSE failures should not break streaming
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
				// Early-exit if already aborted (prevents hanging on reader.read())
				if (controller.signal.aborted) {
					reader.cancel(controller.signal.reason);
					throw new DOMException(
						controller.signal.reason ?? "Aborted",
						"AbortError",
					);
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
				? StreamError.aborted(
						typeof controller.signal.reason === "string"
							? controller.signal.reason
							: undefined,
					)
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
