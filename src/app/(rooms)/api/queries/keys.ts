export const queryKeys = {
	rooms: {
		all: ["rooms"] as const,
		list() {
			return [...queryKeys.rooms.all, "list"] as const;
		},
		participantModels() {
			return [...queryKeys.rooms.all, "participant-models"] as const;
		},
		detail(roomId: string) {
			return [...queryKeys.rooms.all, "detail", roomId] as const;
		},
	},
} as const;
