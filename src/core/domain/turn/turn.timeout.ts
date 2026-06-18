// src/core/domain/turn/turn.timeout-policy.ts
import { type IResult, Result } from "@briom/libs/drimion";

import { StreamError } from "./streams";
import type { Turn } from "./turn";

export interface TimeoutThreshold {
	readonly ms: number;
}

export class TurnTimeoutPolicy {
	public static readonly DEFAULT: TimeoutThreshold = { ms: 30000 };

	public constructor(
		private readonly threshold: TimeoutThreshold = TurnTimeoutPolicy.DEFAULT,
	) {}

	public get THRESHOLD(): TimeoutThreshold {
		return this.threshold;
	}

	public check(
		turn: Turn,
		now: Date = new Date(),
	): IResult<StreamError, never> | null {
		if (!turn.isPending && !turn.isStreaming) {
			return null;
		}

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

	public isApplicable(turn: Turn): boolean {
		return turn.isPending || turn.isStreaming;
	}
}
