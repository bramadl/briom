import { roomQueries } from "@briom/rooms/api/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetParticipantModelsQuery() {
	return useSuspenseQuery(roomQueries.getParticipantModels({}));
}
