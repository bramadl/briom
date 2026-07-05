import { queryOptions } from "@tanstack/react-query";

import { getParticipantModels } from "../actions/get-participant-models.action";
import { participantQueryKeys } from "./query.keys";

export const participantQueryOptions = {
	getParticipantModels: () => {
		return queryOptions({
			queryKey: participantQueryKeys.models(),
			queryFn: getParticipantModels,
		});
	},
};
