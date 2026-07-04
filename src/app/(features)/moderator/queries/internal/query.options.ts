import { unwrap } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getProfile } from "../../actions/get-profile";
import { moderatorQueryKeys } from "./query.keys";

export const moderatorQueryOptions = {
	getProfile: () => {
		return queryOptions({
			queryKey: moderatorQueryKeys.profile(),
			queryFn: async () => unwrap(await getProfile()),
			staleTime: Infinity,
		});
	},
};
