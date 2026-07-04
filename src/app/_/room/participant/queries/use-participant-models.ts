import { useSuspenseQuery } from "@tanstack/react-query";

import { participantQueryOptions } from "./internal/query.options";

export function useParticipantModels() {
	return useSuspenseQuery(participantQueryOptions.getParticipantModels());
}
