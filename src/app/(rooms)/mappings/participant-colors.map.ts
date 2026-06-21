export const PARTICIPANT_COLORS = [
	{
		all: "border bg-terracotta",
		border: "border-l-terracotta",
		dot: "bg-terracotta",
		text: "text-terracotta",
	},
	{
		all: "border bg-dusty-blue",
		border: "border-l-dusty-blue",
		dot: "bg-dusty-blue",
		text: "text-dusty-blue",
	},
	{
		all: "border bg-sage",
		border: "border-l-sage",
		dot: "bg-sage",
		text: "text-sage",
	},
	{
		all: "border bg-muted-lavender",
		border: "border-l-muted-lavender",
		dot: "bg-muted-lavender",
		text: "text-muted-lavender",
	},
	{
		all: "border bg-warm-sienna",
		border: "border-l-warm-sienna",
		dot: "bg-warm-sienna",
		text: "text-warm-sienna",
	},
];

export function hashToIndex(str: string, length: number): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash) % length;
}

export function getParticipantTheme(participantId: string | null | undefined) {
	if (!participantId) return PARTICIPANT_COLORS[0];
	return PARTICIPANT_COLORS[
		hashToIndex(participantId, PARTICIPANT_COLORS.length)
	];
}
