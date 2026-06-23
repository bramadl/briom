import { roomQueries } from "@briom/rooms/_bak/api/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetParticipantModelsQuery() {
	return useSuspenseQuery(roomQueries.getParticipantModels({}));
}
