import type { GetParticipantModelsInput } from "@briom/app/bak";
import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getParticipantModels } from "../actions";

import { participantQueryKeys } from "./keys";

export interface ParticipantQueryFnData {
	GetParticipantModels: Awaited<ReturnType<typeof getParticipantModels>>;
}

export const participantQueries = {
	getModels(input: GetParticipantModelsInput) {
		return queryOptions({
			queryKey: participantQueryKeys.models(),
			queryFn: async () => {
				const result = await getParticipantModels(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
};
