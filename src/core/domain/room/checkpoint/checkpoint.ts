import { Entity, validator as v } from "@drimion";

import type { CreditUsage } from "../../moderator/credit/credit.usage";
import type { RoomId } from "../room.id";

import type { CheckpointId } from "./checkpoint.id";
import { EmptyCheckpointError } from "./errors/empty-checkpoint.error";

interface CheckpointProps {
	/**
	 * @description
	 * Cumulative summary of the deliberation up to `coverSequences`.
	 *
	 * Each new checkpoint synthesizes the previous checkpoint (if any)
	 * plus every turn settled since — never starts from scratch.
	 */
	content: string;

	/**
	 * @description
	 * The highest turn sequence this checkpoint accounts for.
	 *
	 * Plain number, not TurnSequence — this is a boundary marker,
	 * not a turn's own ordinal position.
	 */
	coverSequences: number;

	/**
	 * @description
	 * When this checkpoint was generated.
	 */
	createdAt: Date;

	/**
	 * @description
	 * Qualified model that successfully produced this checkpoint.
	 *
	 * Retry/fallback logic across a model pool is application-layer
	 * concern — the domain only records the model that ultimately succeeded.
	 */
	generatedBy: string;

	/**
	 * @description
	 * Stable identity for this checkpoint.
	 */
	id: CheckpointId;

	/**
	 * @description
	 * Which generation this is within the room — 1st, 2nd checkpoint, etc.
	 *
	 * Drives the word budget policy: later iterations get a larger budget to
	 * offset compounding information loss from repeated summarization.
	 */
	iteration: number;

	/**
	 * @description
	 * The checkpoint this one was built from, or null if this is the first.
	 * Kept for audit trail — rendering only ever needs the latest checkpoint.
	 */
	previousCheckpointId: CheckpointId | null;

	/**
	 * @description
	 * The Room this checkpoint summarizes.
	 */
	roomId: RoomId;

	/**
	 * @description
	 * Token/cost metadata for the LLM call that generated this checkpoint.
	 *
	 * Null only if the generating model didn't report usage (free-tier models
	 * commonly don't) — application layer falls back to character estimation
	 * in that case, but doesn't backfill this field with an estimate.
	 */
	usage: CreditUsage | null;
}

/**
 * @description
 * A point-in-time compression of a Room's deliberation history.
 *
 * When a room's turn history grows large enough to threaten context window
 * efficiency, a Checkpoint captures everything up to a given turn as a single
 * dense summary. Rendering then uses the latest Checkpoint plus only the
 * turns that came after it — keeping every LLM call's payload bounded
 * regardless of how long the deliberation runs.
 *
 * Checkpoints are cumulative, not independent snapshots: each new one is
 * built from the previous checkpoint's content plus the turns settled since,
 * so no information from earlier in the room is ever silently dropped.
 *
 * A Checkpoint carries no author and no intent — it isn't a contribution to
 * the deliberation, it's infrastructure that protects the deliberation's
 * ability to keep going.
 */
export class Checkpoint extends Entity<CheckpointProps> {
	private constructor(props: CheckpointProps) {
		super(props);
	}

	public static override isValidProps(
		props: CheckpointProps,
	): EmptyCheckpointError | undefined {
		if (v.string(props.content).isEmpty()) return new EmptyCheckpointError();
	}

	/**
	 * @description
	 * Cumulative summary of the deliberation up to `coverSequences`.
	 *
	 * Each new checkpoint synthesizes the previous checkpoint (if any) plus
	 * every turn settled since — never starts from scratch.
	 */
	public get content(): string {
		return this.get("content");
	}

	/**
	 * @description
	 * The highest turn sequence this checkpoint accounts for.
	 *
	 * Plain number, not TurnSequence — this is a boundary marker, not a turn's
	 * own ordinal position.
	 */
	public get coverSequences(): number {
		return this.get("coverSequences");
	}

	/**
	 * @description
	 * Qualified model that successfully produced this checkpoint.
	 *
	 * Retry/fallback logic across a model pool is application-layer concern —
	 * the domain only records the model that ultimately succeeded.
	 */
	public get generatedBy(): string {
		return this.get("generatedBy");
	}

	/**
	 * @description
	 * Which generation this is within the room — 1st, 2nd checkpoint, etc.
	 *
	 * Drives the word budget policy: later iterations get a larger budget to
	 * offset compounding information loss from repeated summarization.
	 */
	public get iteration(): number {
		return this.get("iteration");
	}

	/**
	 * @description
	 * The checkpoint this one was built from, or null if this is the first.
	 * Kept for audit trail — rendering only ever needs the latest checkpoint.
	 */
	public get previousCheckpointId(): CheckpointId | null {
		return this.get("previousCheckpointId");
	}

	/**
	 * @description
	 * The Room this checkpoint summarizes.
	 */
	public get roomId(): RoomId {
		return this.get("roomId");
	}

	/**
	 * @description
	 * Token/cost metadata for the LLM call that generated this checkpoint.
	 * Null only if the generating model didn't report usage (free-tier models
	 * commonly don't) — application layer falls back to character estimation
	 * in that case, but doesn't backfill this field with an estimate.
	 */
	public get usage(): CreditUsage | null {
		return this.get("usage");
	}
}
