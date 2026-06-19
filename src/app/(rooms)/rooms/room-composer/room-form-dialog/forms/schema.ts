import type { FieldArrayStore, FormStore } from "@formisch/react";
import * as v from "valibot";

export const MAX_PARTICIPANTS = 4;

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
			MAX_PARTICIPANTS,
			`Up to ${MAX_PARTICIPANTS} perspectives keeps the deliberation focused.`,
		),
	),
});

export interface RoomFormSchema {
	disabled?: boolean;
	form: FormStore<typeof RoomFormSchema>;
}

export interface RoomFormArraySchema extends RoomFormSchema {
	fieldArray: FieldArrayStore<typeof RoomFormSchema>;
}
