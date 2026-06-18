import { type IResult, Result } from "@briom/libs/drimion";

import { StreamError } from "./streams";
import type { Turn } from "./turn";

/**
 * @description
 * Threshold configuration for turn timeout policy.
 */
export interface TimeoutThreshold {
	readonly ms: number;
}

/**
 * @description
 * `TurnTimeoutPolicy` — Domain Service
 *
 * Guards against indefinitely hanging LLM streams by defining a maximum duration
 * that a turn can remain in `PENDING` or `STREAMING` status.
 *
 * **Why this exists**
 * Without timeout protection, a stalled LLM connection would block the deliberation
 * permanently. The policy provides a clean failure path: timeout → fail → retry.
 *
 * **Default threshold**: 30 seconds (suitable for most model responses).
 * Configurable via constructor for different latency requirements.
 *
 * **Human-Led Principle**
 * The timeout is a safety guardrail, not an autonomous decision. The moderator
 * can always retry the failed turn.
 */
export class TurnTimeoutPolicy {
	public static readonly DEFAULT: TimeoutThreshold = { ms: 30000 };

	public constructor(
		private readonly threshold: TimeoutThreshold = TurnTimeoutPolicy.DEFAULT,
	) {}

	/**
	 * @description
	 * The configured timeout threshold.
	 */
	public get THRESHOLD(): TimeoutThreshold {
		return this.threshold;
	}

	/**
	 * @description
	 * Checks if a turn has exceeded the timeout threshold.
	 *
	 * @param turn - The turn to check
	 * @param now - Optional timestamp (defaults to current time)
	 * @returns Result containing StreamError if timed out, null if still within threshold
	 */
	public check(
		turn: Turn,
		now: Date = new Date(),
	): IResult<StreamError, never> | null {
		if (!turn.isPending && !turn.isStreaming) return null;

		const createdAt = turn.get("createdAt");
		const elapsedMs = now.getTime() - createdAt.getTime();

		if (elapsedMs > this.threshold.ms) {
			return Result.success(
				StreamError.timeout(
					`Turn timed out after ${elapsedMs}ms (threshold: ${this.threshold.ms}ms)`,
				),
			);
		}

		return null;
	}

	/**
	 * @description
	 * Whether this policy applies to the given turn's current status.
	 */
	public isApplicable(turn: Turn): boolean {
		return turn.isPending || turn.isStreaming;
	}
}
