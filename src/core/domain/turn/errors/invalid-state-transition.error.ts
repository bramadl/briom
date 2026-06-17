import { DomainError } from "@briom/libs/drimion";

import type { TurnStatusOption } from "../options/turn-status.option";

export class InvalidStateTransitionError extends DomainError {
	public constructor(
		from: TurnStatusOption,
		to: TurnStatusOption,
		reason?: string,
	) {
		super(
			`Cannot transition from "${from}" to "${to}"${reason ? `: ${reason}` : ""}`,
			{ context: "Turn" },
		);
	}
}
