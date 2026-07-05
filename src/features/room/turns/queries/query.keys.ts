export const turnQueryKeys = {
	all: ["all"] as const,
	proposals: (roomId: string) => [...turnQueryKeys.all, roomId, "proposals"],
};
