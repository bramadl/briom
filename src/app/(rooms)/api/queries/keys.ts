export interface QueryKeys {
	Rooms: {
		Get: ReturnType<typeof queryKeys.rooms.get>;
		List: ReturnType<typeof queryKeys.rooms.list>;
		ParticipantModels: ReturnType<typeof queryKeys.rooms.participantModels>;
	};
	Turns: {
		List: ReturnType<typeof queryKeys.turns.list>;
		Proposals: ReturnType<typeof queryKeys.turns.proposals>;
	};
}

export const queryKeys = {
	rooms: {
		all: ["rooms"] as const,
		get(roomId: string) {
			return [...queryKeys.rooms.all, "detail", roomId] as const;
		},
		list() {
			return [...queryKeys.rooms.all, "list"] as const;
		},
		participantModels() {
			return [...queryKeys.rooms.all, "participant-models"] as const;
		},
	},
	turns: {
		all: ["turns"] as const,
		list(roomId: string) {
			return [...queryKeys.turns.all, "list", roomId] as const;
		},
		proposals(roomId: string) {
			return [...queryKeys.turns.all, "proposals", roomId] as const;
		},
	},
} as const;
