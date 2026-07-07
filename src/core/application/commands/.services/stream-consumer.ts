import type { ITurnRepository, Turn } from "@briom/core/domain";

import type { UsageInfo } from "../../ports/gateways/llm/llm.ref";
import type { ILogger } from "../../ports/logger/logger";
import type { ITurnRealtimePublisher } from "../../ports/publishers/turn-realtime.publisher";
import type { ITurnAbortSignal } from "../../ports/signals/turn-abort.signal";

/**
 * @description
 * Consumes an LLM stream, throttled-flushing accumulated content to a
 * Turn aggregate and checking for abort signals between reads. This
 * is NOT a use case on its own — it's the streaming mechanics
 * extracted out, so that method stays readable as a sequence of
 * business steps, not stream-processing plumbing.
 *
 * Each DB flush is now paired with a realtime publish of the same
 * accumulated content, on the same cadence (`flushIntervalMs`) — this
 * is what lets FE render live tokens via `useRealtime` instead of
 * polling `getTurn`. The publish is fire-and-forget from this class's
 * perspective: it's `await`ed so the underlying Promise settles before
 * the next read, but a failed publish never fails the stream — only a
 * failed *persist* does, since content durability matters and realtime
 * delivery doesn't (a dropped publish just means FE catches up on the
 * next flush's fuller content, or on `getTurn` at settle time).
 */
export class StreamConsumer {
	public constructor(
		private readonly turnRepository: ITurnRepository,
		private readonly turnAbortSignal: ITurnAbortSignal,
		private readonly turnRealtimePublisher: ITurnRealtimePublisher,
		private readonly logger: ILogger,
		private readonly flushIntervalMs: number = 150,
		private readonly chunkTimeoutMs: number = 15_000,
	) {}

	/**
	 * @description
	 * Drains `reader` into `turn`, flushing to persistence at most once
	 * per `flushIntervalMs`. Returns how the stream ended so the caller
	 * decides what happens next (settle vs fail) — this class never calls
	 * turn.settle()/fail() itself, keeping that decision with the command
	 * handler that owns the broader transaction.
	 *
	 * Network drops, provider disconnects, or a rejected `usage` promise
	 * are all caught here and surfaced as `outcome: "failed"` rather than
	 * thrown — an uncaught exception here would leave the Turn stuck in
	 * "streaming" and the Room's slot permanently claimed, since neither
	 * turn.fail() nor room.releaseTurnSlot() would ever run upstream.
	 * The raw error is returned for the caller to log; it is deliberately
	 * NOT wrapped into a domain error here, since infra-level failure
	 * detail (network errors, provider transport internals) doesn't
	 * belong inside the domain layer.
	 */
	public async consume(
		turn: Turn,
		reader: ReadableStreamDefaultReader<string>,
		usage: Promise<UsageInfo>,
	): Promise<
		| { outcome: "completed"; usage: UsageInfo }
		| { outcome: "aborted" }
		| { outcome: "failed"; error: { name: string; message: string } }
	> {
		let buffer = "";
		let lastFlushAt = Date.now();

		try {
			while (true) {
				const abortRequested = await this.turnAbortSignal.isRequested(turn.id);

				if (abortRequested) {
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

				buffer += value;

				if (Date.now() - lastFlushAt >= this.flushIntervalMs) {
					const accResult = turn.accumulate(buffer);
					if (accResult.isSuccess()) {
						const publishPromise = this.publishAccumulated(turn);
						await this.turnRepository.persist(turn);
						await publishPromise;
					}

					buffer = "";
					lastFlushAt = Date.now();
				}
			}

			if (buffer.length > 0) {
				turn.accumulate(buffer);
				await this.publishAccumulated(turn);
			}

			const resolvedUsage = await usage;
			return { outcome: "completed", usage: resolvedUsage };
		} catch (error) {
			const errorName = error instanceof Error ? error.name : typeof error;
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			this.logger.error("[StreamConsumer] raw stream error:", {
				turnId: turn.id.value(),
				errorName,
				errorMessage,
				errorStack: error instanceof Error ? error.stack : undefined,
			});

			if (buffer.length > 0) {
				try {
					const accResult = turn.accumulate(buffer);
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

	/**
	 * @description
	 * Publishes the turn's current accumulated content to the realtime
	 * channel. Swallows its own errors — a broadcast failure is not a
	 * streaming failure, see this class's doc comment.
	 */
	private async publishAccumulated(turn: Turn): Promise<void> {
		try {
			await this.turnRealtimePublisher.publishTokenAccumulated(
				turn.get("roomId").value(),
				{
					turnId: turn.id.value(),
					content: turn.currentContent,
				},
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
			// biome-ignore lint/style/noNonNullAssertion: Promise race.
			clearTimeout(timer!);
		}
	}
}
