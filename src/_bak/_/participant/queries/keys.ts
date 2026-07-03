export const participantQueryKeys = {
	all: ["all"] as const,
	models: () => {
		return [...participantQueryKeys.all, "models"] as const;
	},
};
