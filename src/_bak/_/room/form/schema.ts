import * as v from "valibot";

import { ROOM_SETTING } from "../config/setting";

const maxParticipant = ROOM_SETTING.MAXIMUM_PARTICIPANT;

export const RoomFormSchema = v.object({
	title: v.pipe(
		v.string(),
		v.minLength(4, "A room needs a name to be remembered."),
		v.maxLength(
			64,
			"Keep it concise — the deliberation will fill in the rest.",
		),
	),
	participants: v.pipe(
		v.array(
			v.object({
				displayName: v.pipe(
					v.string(),
					v.nonEmpty("Every participant deserves a name."),
					v.maxLength(64, "Short and memorable works best."),
				),
				model: v.pipe(v.string()),
				provider: v.pipe(v.string()),
			}),
		),
		v.minLength(1, "A room needs at least one perspective to begin."),
		v.maxLength(
			maxParticipant,
			`Up to ${maxParticipant} perspectives keeps the deliberation focused.`,
		),
	),
});
