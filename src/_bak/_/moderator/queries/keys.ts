export const moderatorQueryKeys = {
	all: ["all"] as const,
	usage() {
		return [...moderatorQueryKeys.all, "usage"] as const;
	},
};
