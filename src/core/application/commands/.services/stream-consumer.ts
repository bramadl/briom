import type { ITurnRepository, Turn } from "@briom/core/domain";

import type { UsageInfo } from "../../ports/gateways/llm/llm.ref";
import type { ITurnAbortSignal } from "../../ports/signals/turn-abort.signal";

/**
 * @description
 * Consumes an LLM stream, throttled-flushing accumulated content to a
 * Turn aggregate and checking for abort signals between reads. This
 * is NOT a use case on its own — it's the streaming mechanics
 * extracted out, so that method stays readable as a sequence of
 * business steps, not stream-processing plumbing.
 */
export class StreamConsumer {
	public constructor(
		private readonly turnRepository: ITurnRepository,
		private readonly turnAbortSignal: ITurnAbortSignal,
		private readonly flushIntervalMs: number = 1000,
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
		| { outcome: "failed"; error: unknown }
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

				const { done, value } = await reader.read();
				if (done) break;

				buffer += value;

				if (Date.now() - lastFlushAt >= this.flushIntervalMs) {
					const accResult = turn.accumulate(buffer);
					if (accResult.isSuccess()) {
						await this.turnRepository.persist(turn);
					}

					buffer = "";
					lastFlushAt = Date.now();
				}
			}

			if (buffer.length > 0) turn.accumulate(buffer);

			const resolvedUsage = await usage;
			return { outcome: "completed", usage: resolvedUsage };
		} catch (error) {
			// Best-effort: preserve whatever content streamed in since the
			// last flush before we give up, so a network drop 900ms into
			// a 1000ms flush window doesn't silently drop that trailing
			// text on top of failing the turn.
			if (buffer.length > 0) {
				try {
					const accResult = turn.accumulate(buffer);
					if (accResult.isSuccess()) await this.turnRepository.persist(turn);
				} catch {
					// intentionally ignored — we're already on the failure
					// path, a secondary persist failure shouldn't mask it
				}
			}

			// Best-effort: release the reader lock so the underlying
			// connection isn't left dangling. Swallow any secondary
			// error from cancel() itself for the same reason as above.
			try {
				reader.cancel();
			} catch {
				// intentionally ignored
			}

			return { outcome: "failed", error };
		}
	}
}
