export const roomQueryKeys = {
	all: ["all"] as const,
	room(roomId: string) {
		return [...roomQueryKeys.all, "room", roomId] as const;
	},
	rooms() {
		return [...roomQueryKeys.all, "rooms"] as const;
	},
	participantModels() {
		return [...roomQueryKeys.all, "participant:models"] as const;
	},
};
