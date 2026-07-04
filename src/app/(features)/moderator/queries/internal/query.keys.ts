export const moderatorQueryKeys = {
	all: ["all"] as const,
	profile: () => [...moderatorQueryKeys.all, "profile"],
};
