export const turnQueryKeys = {
	all: ["all"] as const,
	turns(roomId: string) {
		return [...turnQueryKeys.all, "turns", roomId] as const;
	},
	proposals(roomId: string) {
		return [...turnQueryKeys.all, "proposals", roomId] as const;
	},
};
