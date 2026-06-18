import { type IResult, Result, ValueObject } from "@briom/libs/drimion";

import { EmptyPerspectiveError } from "./errors/empty-perspective.error";

interface TurnPerspectiveProps {
	content: string;
	renderedAt: Date | null;
}

/**
 * @description
 * `TurnPerspective` — Value Object
 *
 * The actual reasoning contribution of a turn: the content and when it was
 * finalized. Represents the unique perspective that a participant (or moderator)
 * brings to the deliberation.
 *
 * **Ubiquitous Language**
 * - `Perspective`: the unique reasoning contribution (NOT "answer", "output", "generation")
 * - `Rendered`: when the perspective was finalized (NOT "sent", "delivered")
 * - `Content`: the actual text of the reasoning contribution
 *
 * **Lifecycle**
 * ```
 * empty() → fromTokens(tokens[]) → finalize(content)
 *               ↑_____________________|
 * ```
 * - `empty()`: initial state before streaming
 * - `fromTokens()`: incremental accumulation during streaming
 * - `finalize()`: final state after streaming completes
 */
export class TurnPerspective extends ValueObject<TurnPerspectiveProps> {
	private constructor(props: TurnPerspectiveProps) {
		super(props);
	}

	/**
	 * @description
	 * Creates an empty perspective for a newly initiated turn.
	 * Content is blank; `renderedAt` is null until finalized.
	 */
	public static empty(): TurnPerspective {
		return new TurnPerspective({
			content: "",
			renderedAt: null,
		});
	}

	/**
	 * @description
	 * Creates a perspective from accumulated tokens during streaming.
	 * `renderedAt` remains null — perspective is not yet finalized.
	 */
	public static fromTokens(tokens: string[]): TurnPerspective {
		return new TurnPerspective({
			content: tokens.join(""),
			renderedAt: null,
		});
	}

	/**
	 * @description
	 * Finalizes a perspective with complete content and records the render timestamp.
	 *
	 * **Invariant**: Content must be non-empty.
	 *
	 * @param content - The complete, final perspective text
	 * @returns Result containing finalized Perspective or EmptyPerspectiveError
	 */
	public static finalize(
		content: string,
	): IResult<TurnPerspective, EmptyPerspectiveError> {
		if (!content || content.trim().length === 0) {
			return Result.error(new EmptyPerspectiveError());
		}

		const perspective = new TurnPerspective({
			content,
			renderedAt: new Date(),
		});

		return Result.success(perspective);
	}

	/**
	 * @description
	 * Rehydrates from persistence.
	 */
	public static rehydrate(props: TurnPerspectiveProps): TurnPerspective {
		return new TurnPerspective(props);
	}
}
