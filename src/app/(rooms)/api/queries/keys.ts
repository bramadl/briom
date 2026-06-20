export const queryKeys = {
	rooms: {
		all: ["rooms"] as const,
		list() {
			return [...queryKeys.rooms.all, "list"] as const;
		},
		participantModels() {
			return [...queryKeys.rooms.all, "participant-models"] as const;
		},
		get(roomId: string) {
			return [...queryKeys.rooms.all, "detail", roomId] as const;
		},
	},
	turns: {
		all: ["turns"] as const,
		list() {
			return [...queryKeys.turns.all, "list"] as const;
		},
	},
} as const;
