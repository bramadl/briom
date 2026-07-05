export const participantQueryKeys = {
	all: ["all"] as const,
	models: () => [...participantQueryKeys.all, "models"],
};
