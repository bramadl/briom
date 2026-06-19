import type { GetParticipantModelsInput, GetRoomsInput } from "@briom/app";
import { queryOptions } from "@tanstack/react-query";

import { getParticipantModels, getRooms } from "../room.actions";
import { queryKeys } from "./keys";

export const roomQueries = {
	getParticipantModels(input: GetParticipantModelsInput) {
		return queryOptions<
			Awaited<ReturnType<typeof getParticipantModels>>,
			Error,
			Awaited<ReturnType<typeof getParticipantModels>>,
			ReturnType<typeof queryKeys.rooms.participantModels>
		>({
			queryFn: async () => getParticipantModels(input),
			queryKey: queryKeys.rooms.participantModels(),
		});
	},
	getRooms(input: GetRoomsInput) {
		return queryOptions<
			Awaited<ReturnType<typeof getRooms>>,
			Error,
			Awaited<ReturnType<typeof getRooms>>,
			ReturnType<typeof queryKeys.rooms.list>
		>({
			queryFn: async () => getRooms(input),
			queryKey: queryKeys.rooms.list(),
		});
	},
};
