export const roomQueryKeys = {
	all: ["all"] as const,
	getRooms: () => [...roomQueryKeys.all, "rooms"] as const,
} as const;
