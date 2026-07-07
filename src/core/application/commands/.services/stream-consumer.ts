import type { ITurnRepository, Turn } from "@briom/core/domain";

import type { UsageInfo } from "../../ports/gateways/llm/llm.ref";
import type { ILogger } from "../../ports/logger/logger";
import type { ITurnRealtimePublisher } from "../../ports/publishers/turn-realtime.publisher";
import type { ITurnAbortSignal } from "../../ports/signals/turn-abort.signal";

/**
 * @description
 * Consumes an LLM stream, broadcasting and persisting accumulated
 * content on two INDEPENDENT timers that run concurrently with the
 * reader loop — neither ever blocks `reader.read()`.
 *
 * Broadcast sends only the DELTA since the last tick (matches the
 * domain event `TurnTokenAccumulated.token`), on a tight, non-durable
 * cadence. Persist is a slower, durable DB write on its own cadence.
 * Both use a re-entrancy guard: if a tick is still in flight when the
 * next one fires, that next tick is skipped and its buffer carries
 * over — graceful degradation under slow I/O instead of blocking the
 * reader.
 *
 * The in-flight PROMISE for each timer (not just a boolean flag) is
 * tracked and explicitly awaited during shutdown — this is the part
 * that was missing before and caused a real race: `clearInterval`
 * only stops FUTURE ticks, it does nothing about a tick that's
 * already mid-flight (e.g. still awaiting its DB write) at the exact
 * moment the reader loop ends. Without waiting for it, the final
 * drain's own persist call could run concurrently with that straggler
 * — and if the straggler (holding an OLDER, pre-settle snapshot of
 * `turn`) happened to resolve its DB write AFTER the final drain's
 * newer write, it would silently overwrite the turn's row back to an
 * earlier state (e.g. reverting `status` from "settled" back to
 * "streaming"). That's a durable, DB-level regression — the UI still
 * looked fine (FE already had the full content via realtime
 * broadcast, independent of this), but `room.isAcceptingTurns` reading
 * that stale row would then wrongly refuse the next turn, and the
 * room could look "stuck re-streaming" for a moment on refetch. Now,
 * shutdown always awaits any straggler to fully complete BEFORE the
 * final drain runs, so writes are strictly ordered: nothing can land
 * after the true final write.
 */
export class StreamConsumer {
	public constructor(
		private readonly turnRepository: ITurnRepository,
		private readonly turnAbortSignal: ITurnAbortSignal,
		private readonly turnRealtimePublisher: ITurnRealtimePublisher,
		private readonly logger: ILogger,
		private readonly broadcastIntervalMs: number = 30,
		private readonly persistIntervalMs: number = 500,
		private readonly chunkTimeoutMs: number = 15_000,
	) {}

	public async consume(
		turn: Turn,
		reader: ReadableStreamDefaultReader<string>,
		usage: Promise<UsageInfo>,
	): Promise<
		| { outcome: "completed"; usage: UsageInfo }
		| { outcome: "aborted" }
		| { outcome: "failed"; error: { name: string; message: string } }
	> {
		let broadcastBuffer = "";
		let persistBuffer = "";

		let persistInFlight: Promise<void> | null = null;
		let broadcastInFlight: Promise<void> | null = null;

		const broadcastTimer = setInterval(() => {
			if (broadcastInFlight || broadcastBuffer.length === 0) return;

			const delta = broadcastBuffer;
			broadcastBuffer = "";

			broadcastInFlight = this.publishDelta(turn, delta).finally(() => {
				broadcastInFlight = null;
			});
		}, this.broadcastIntervalMs);

		const persistTimer = setInterval(() => {
			if (persistInFlight || persistBuffer.length === 0) return;

			const chunk = persistBuffer;
			persistBuffer = "";

			const accResult = turn.accumulate(chunk);
			if (!accResult.isSuccess()) return;

			persistInFlight = this.turnRepository
				.persist(turn)
				.catch((error) => {
					this.logger.error("[StreamConsumer] periodic persist failed", {
						turnId: turn.id.value(),
						errorMessage:
							error instanceof Error ? error.message : String(error),
					});
				})
				.finally(() => {
					persistInFlight = null;
				});
		}, this.persistIntervalMs);

		/**
		 * @description
		 * Stops future ticks AND waits for any tick already in flight
		 * to fully resolve — must always be called before any code
		 * downstream reads or writes `turn` again, to guarantee strict
		 * write ordering (see this class's doc comment).
		 */
		const stopTimersAndDrainInFlight = async (): Promise<void> => {
			clearInterval(broadcastTimer);
			clearInterval(persistTimer);

			await Promise.all([persistInFlight, broadcastInFlight]);
		};

		try {
			while (true) {
				const abortRequested = await this.turnAbortSignal.isRequested(turn.id);

				if (abortRequested) {
					await stopTimersAndDrainInFlight();
					reader.cancel();
					await this.turnAbortSignal.clear(turn.id);
					return { outcome: "aborted" };
				}

				const { done, value } = await this.withTimeout(
					reader.read(),
					this.chunkTimeoutMs,
					"reader.read()",
				);

				if (done) break;

				broadcastBuffer += value;
				persistBuffer += value;
			}

			await stopTimersAndDrainInFlight();

			if (persistBuffer.length > 0) {
				const accResult = turn.accumulate(persistBuffer);
				if (accResult.isSuccess()) {
					await this.turnRepository.persist(turn);
				}
				persistBuffer = "";
			}

			if (broadcastBuffer.length > 0) {
				await this.publishDelta(turn, broadcastBuffer);
				broadcastBuffer = "";
			}

			const resolvedUsage = await usage;
			return { outcome: "completed", usage: resolvedUsage };
		} catch (error) {
			await stopTimersAndDrainInFlight();

			const errorName = error instanceof Error ? error.name : typeof error;
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			this.logger.error("[StreamConsumer] raw stream error:", {
				turnId: turn.id.value(),
				errorName,
				errorMessage,
				errorStack: error instanceof Error ? error.stack : undefined,
			});

			if (persistBuffer.length > 0) {
				try {
					const accResult = turn.accumulate(persistBuffer);
					if (accResult.isSuccess()) await this.turnRepository.persist(turn);
				} catch {}
			}

			try {
				reader.cancel();
			} catch {}

			return {
				outcome: "failed",
				error: { name: errorName, message: errorMessage },
			};
		}
	}

	private async publishDelta(turn: Turn, token: string): Promise<void> {
		try {
			await this.turnRealtimePublisher.publishTokenAccumulated(
				turn.get("roomId").value(),
				{ turnId: turn.id.value(), token },
			);
		} catch {}
	}

	private async withTimeout<T>(
		promise: Promise<T>,
		ms: number,
		label: string,
	): Promise<T> {
		let timer: ReturnType<typeof setTimeout>;
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error(`TIMEOUT: ${label} exceeded ${ms}ms`)),
				ms,
			);
		});

		try {
			return await Promise.race([promise, timeout]);
		} finally {
			// biome-ignore lint/style/noNonNullAssertion: Promise.race
			clearTimeout(timer!);
		}
	}
}
