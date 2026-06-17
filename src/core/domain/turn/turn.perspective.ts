import { type IResult, Result, ValueObject } from "@briom/libs/drimion";

import { EmptyPerspectiveError } from "./errors/empty-perspective.error";

interface TurnPerspectiveProps {
	content: string;
	renderedAt: Date | null;
}

export class TurnPerspective extends ValueObject<TurnPerspectiveProps> {
	private constructor(props: TurnPerspectiveProps) {
		super(props);
	}

	public static empty(): TurnPerspective {
		return new TurnPerspective({
			content: "",
			renderedAt: null,
		});
	}

	public static fromTokens(tokens: string[]): TurnPerspective {
		return new TurnPerspective({
			content: tokens.join(""),
			renderedAt: null,
		});
	}

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
}
