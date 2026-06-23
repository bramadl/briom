import { isServerError } from "@briom/libs/server-action";
import type { QueryClient } from "@tanstack/react-query";

import { getParticipantModels } from "../../actions";
import { participantQueries } from "../registry";

export async function prefetchModels(queryClient: QueryClient) {
	const result = await getParticipantModels({});
	if (isServerError(result)) throw new Error(result.error.message);

	void queryClient.prefetchQuery(participantQueries.getModels({}));

	const { models, useFreeModels } = result.data;
	return { models, useFreeModels };
}
