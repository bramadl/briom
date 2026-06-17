export const ParticipantRole = {
	USER: "user",
	ASSISTANT: "assistant",
} as const;

export type ParticipantRole =
	(typeof ParticipantRole)[keyof typeof ParticipantRole];
