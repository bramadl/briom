import { hashToIndex } from "@briom/libs/utils";

export const PARTICIPANT_THEMES = [
	{
		all: "border bg-terracotta-background text-terracotta",
		border: "border-l-terracotta",
		dot: "bg-terracotta",
		text: "text-terracotta",
	},
	{
		all: "border bg-dusty-blue-background text-dusty-blue",
		border: "border-l-dusty-blue",
		dot: "bg-dusty-blue",
		text: "text-dusty-blue",
	},
	{
		all: "border bg-sage-background text-sage",
		border: "border-l-sage",
		dot: "bg-sage",
		text: "text-sage",
	},
	{
		all: "border bg-muted-lavender-background text-muted-lavender",
		border: "border-l-muted-lavender",
		dot: "bg-muted-lavender",
		text: "text-muted-lavender",
	},
	{
		all: "border bg-warm-sienna-background text-warm-sienna",
		border: "border-l-warm-sienna",
		dot: "bg-warm-sienna",
		text: "text-warm-sienna",
	},
] as const;

export function getParticipantTheme(participantId: string | null | undefined) {
	if (!participantId) return PARTICIPANT_THEMES[0];
	return PARTICIPANT_THEMES[
		hashToIndex(participantId, PARTICIPANT_THEMES.length)
	];
}
