import { useSuspenseQuery } from "@tanstack/react-query";

import { participantQueryOptions } from "../queries/query.options";

export function useParticipantModels() {
	return useSuspenseQuery(participantQueryOptions.getParticipantModels());
}
