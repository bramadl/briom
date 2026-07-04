import * as v from "valibot";

export const RoomFormSchema = (maxParticipant: number) =>
	v.object({
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

export type RoomFormSchema = ReturnType<typeof RoomFormSchema>;
export type RoomFormParticipantSchema = Partial<
	v.InferInput<RoomFormSchema>["participants"][number]
>[];
