import { queryOptions } from "@tanstack/react-query";

import { getParticipantModels } from "../../actions/get-participant-models.action";
import { participantQueryKeys } from "./query.keys";

export const participantQueryOptions = {
	getParticipantModels: () => {
		return queryOptions({
			queryKey: participantQueryKeys.models(),
			// NO UNWRAP NEEDED – OR SDK is being used internally.
			queryFn: getParticipantModels,
		});
	},
};
