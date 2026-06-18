import {
	INTENT_OPTION,
	type IntentOption,
	TURN_STATUS_OPTION,
	type TurnStatusOption,
} from "@briom/core/domain";
import { pgEnum } from "drizzle-orm/pg-core";

export const authorTypeEnum = pgEnum("author_type", [
	"moderator",
	"participant",
]);

export const intentEnum = pgEnum(
	"intent",
	Object.values(INTENT_OPTION) as [IntentOption, ...IntentOption[]],
);

export const turnStatusEnum = pgEnum(
	"turn_status",
	Object.values(TURN_STATUS_OPTION) as [
		TurnStatusOption,
		...TurnStatusOption[],
	],
);
