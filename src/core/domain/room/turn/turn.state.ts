import { type IResult, ValueObject } from "@drimion";

import { EmptyPerspectiveError } from "./errors/empty-perspective.error";
import type { TurnError } from "./turn.error";

type PendingState = { status: "pending" };
type StreamingState = { status: "streaming"; tokens: string[] };
type SettledState = { status: "settled"; content: string; settledAt: Date };
type FailedState = {
	status: "failed";
	error: TurnError;
	failedAt: Date;
	tokens: string[];
};
type AbandonedState = { status: "abandoned" };

/**
 * @description
 * Turn lifecycle states.
 *
 * Represents the progression of a single contribution from initiation through
 * streaming to final settlement (or failure). The state machine is enforced by
 * the `Turn` aggregate's domain methods.
 */
export type TurnStateProps =
	| PendingState
	| StreamingState
	| SettledState
	| FailedState
	| AbandonedState;

/**
 * @description
 * The full lifecycle state of a Turn, carried as a single immutable value.
 *
 * Each status variant holds only the data relevant to that state —
 * no nullable fields, no cross-state ambiguity.
 *
 * Transitions are owned by the Turn aggregate. TurnState is a pure
 * data container; it does not validate transitions.
 */
export class TurnState extends ValueObject<TurnStateProps> {
	private constructor(props: TurnStateProps) {
		super(props);
	}

	public static override isValidProps(
		props: TurnStateProps,
	): EmptyPerspectiveError | undefined {
		if (props.status === "settled") {
			if (!props.content || props.content.trim().length === 0) {
				return new EmptyPerspectiveError();
			}
		}
	}

	/**
	 * @description
	 * Initial state for a newly initiated participant turn.
	 */
	public static pending(): TurnState {
		return new TurnState({ status: "pending" });
	}

	/**
	 * @description
	 * Transitions into active token accumulation.
	 */
	public static streaming(tokens: string[] = []): TurnState {
		return new TurnState({ status: "streaming", tokens });
	}

	/**
	 * @description
	 * Final state after LLM stream completes.
	 * Content must be non-empty — enforced by isValidProps.
	 */
	public static settled(
		content: string,
	): IResult<TurnState, EmptyPerspectiveError> {
		return TurnState.create({
			status: "settled",
			content,
			settledAt: new Date(),
		});
	}

	/**
	 * @description
	 * Failed state, carries the stream error, timestamp, and whatever
	 * content had already streamed in before the failure — preserved
	 * because the LLM cost for those tokens was already incurred with
	 * the provider, same reasoning as `settle()`'s content preservation.
	 */
	public static failed(error: TurnError, tokens: string[] = []): TurnState {
		return new TurnState({
			status: "failed",
			error,
			failedAt: new Date(),
			tokens,
		});
	}

	/**
	 * @description
	 * Terminal state for a failed turn that the moderator chose to skip.
	 */
	public static abandoned(): TurnState {
		return new TurnState({ status: "abandoned" });
	}

	/**
	 * @description
	 * Wether the state of this turn is pending.
	 */
	public get isPending(): boolean {
		return this.get("status") === "pending";
	}

	/**
	 * @description
	 * Wether the state of this turn is streaming.
	 */
	public get isStreaming(): boolean {
		return this.get("status") === "streaming";
	}

	/**
	 * @description
	 * Wether the state of this turn is settled.
	 */
	public get isSettled(): boolean {
		return this.get("status") === "settled";
	}

	/**
	 * @description
	 * Wether the state of this turn is failed.
	 */
	public get isFailed(): boolean {
		return this.get("status") === "failed";
	}

	/**
	 * @description
	 * Wether the state of this turn is abandoned.
	 */
	public get isAbandoned(): boolean {
		return this.get("status") === "abandoned";
	}

	/**
	 * @description
	 * Accumulated tokens during streaming.
	 * Only meaningful when isStreaming — returns [] otherwise.
	 */
	public get tokens(): string[] {
		const props = this.getRaw();
		if (props.status === "streaming") return props.tokens;
		if (props.status === "failed") return props.tokens;
		return [];
	}

	/**
	 * @description
	 * Final settled content.
	 * Only meaningful when isSettled — returns empty string otherwise.
	 */
	public get content(): string {
		const props = this.getRaw();
		return props.status === "settled" ? props.content : "";
	}

	/**
	 * @description
	 * Current readable content regardless of status.
	 * Streaming: joined tokens. Settled: final content. Otherwise: empty string.
	 */
	public get currentContent(): string {
		const props = this.getRaw();
		if (props.status === "streaming") return props.tokens.join("");
		if (props.status === "failed") return props.tokens.join("");
		if (props.status === "settled") return props.content;
		return "";
	}

	/**
	 * @description
	 * Stream error detail.
	 * Only meaningful when isFailed — returns null otherwise.
	 */
	public get error(): TurnError | null {
		const props = this.getRaw();
		return props.status === "failed" ? props.error : null;
	}

	/**
	 * @description
	 * When this turn was settled.
	 * Only meaningful when isSettled — returns null otherwise.
	 */
	public get settledAt(): Date | null {
		const props = this.getRaw();
		return props.status === "settled" ? props.settledAt : null;
	}

	/**
	 * @description
	 * When this turn failed.
	 * Only meaningful when isFailed — returns null otherwise.
	 */
	public get failedAt(): Date | null {
		const props = this.getRaw();
		return props.status === "failed" ? props.failedAt : null;
	}
}
