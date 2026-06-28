import { useSuspenseQuery } from "@tanstack/react-query";

import { useModeratorUsageInvalidation } from "../queries/invalidations/use-moderator-usage.invalidation";
import { moderatorQueries } from "../queries/registry";

export function useModeratorUsage() {
	const { invalidate } = useModeratorUsageInvalidation();
	const {
		data: { limit, resetsAt, used },
	} = useSuspenseQuery(moderatorQueries.getUsageLimit());

	const isExceeded = used >= limit;
	const isNearLimit = used >= limit * 0.8;

	return {
		exceeded: isExceeded,
		invalidate,
		limit,
		nearLimit: isNearLimit,
		resetsAt,
		used,
	};
}
