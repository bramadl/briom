import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getModeratorUsage } from "../actions";

import { moderatorQueryKeys } from "./keys";

export const moderatorQueries = {
	getUsageLimit() {
		return queryOptions({
			queryKey: moderatorQueryKeys.usage(),
			queryFn: async () => {
				const result = await getModeratorUsage();
				if (isServerError(result)) throw result.error;
				return result.data;
			},
			staleTime: Infinity,
		});
	},
};
