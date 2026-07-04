import { useSuspenseQuery } from "@tanstack/react-query";

import { participantQueryOptions } from "../queries/internal/query.options";

export function useParticipantModels() {
	return useSuspenseQuery(participantQueryOptions.getParticipantModels());
}
