export const roomQueryKeys = {
	all: ["all"] as const,
	getRooms: () => [...roomQueryKeys.all, "rooms"] as const,
	getRoom: (id: string) => [...roomQueryKeys.all, "rooms", id] as const,
} as const;
