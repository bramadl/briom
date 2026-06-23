import { isServerError } from "@briom/libs/server-action";
import { useMemo } from "react";

import { useGetParticipantModelsQuery } from "../queries";

export function useGetParticipantModels() {
	const { data: modelsData } = useGetParticipantModelsQuery();
	if (isServerError(modelsData)) throw new Error(modelsData.error.message);

	const { models, useFreeModels } = modelsData.data;
	const flatModels = useMemo(() => Object.values(models).flat(), [models]);

	return { flatModels, models, useFreeModels };
}
