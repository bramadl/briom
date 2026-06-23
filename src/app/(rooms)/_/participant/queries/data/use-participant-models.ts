import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { participantQueries } from "../registry";

export function useParticipantModels() {
	const {
		data: { models, useFreeModels },
	} = useSuspenseQuery(participantQueries.getModels({}));

	const flatModels = useMemo(() => Object.values(models).flat(), [models]);
	return { flatModels, models, useFreeModels };
}
