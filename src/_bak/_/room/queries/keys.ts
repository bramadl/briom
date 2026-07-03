export const roomQueryKeys = {
	all: ["all"] as const,
	deliberation(roomId: string) {
		return [...roomQueryKeys.all, "deliberation", roomId] as const;
	},
	rooms() {
		return [...roomQueryKeys.all, "rooms"] as const;
	},
	participantModels() {
		return [...roomQueryKeys.all, "participant:models"] as const;
	},
};
