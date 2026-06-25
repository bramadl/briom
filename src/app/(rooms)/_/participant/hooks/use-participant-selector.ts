import type { ParticipantModelDTO } from "@briom/app";
import { useCallback, useDeferredValue, useMemo } from "react";

import { useParticipantModels } from "./use-participant-models";

interface GroupedItems {
	items: ParticipantModelDTO[];
	label: string;
}

interface UseParticipantSelectorOptions {
	chosenParticipants: string;
	search: string;
}

export function useParticipantSelector({
	chosenParticipants,
	search,
}: UseParticipantSelectorOptions) {
	const { flatModels, useFreeModels } = useParticipantModels();

	const deferredInputValue = useDeferredValue(search);
	const isDeferring = search !== deferredInputValue;

	const chosenSet = useMemo(
		() => new Set(chosenParticipants.split(",").filter(Boolean)),
		[chosenParticipants],
	);

	const parseQuery = useCallback((raw: string) => {
		const trimmed = raw.trim();
		const hasFree = /@free/i.test(trimmed);
		const withoutToken = trimmed.replace(/@free/gi, "").trim();
		const terms = withoutToken
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		return { hasFree, terms };
	}, []);

	const filterModels = useCallback(
		(query: string): ParticipantModelDTO[] => {
			const { hasFree, terms } = parseQuery(query);
			return flatModels.filter((model) => {
				if (chosenSet.has(model.qualifiedModel)) return false;
				if (hasFree && !model.isFree) return false;
				if (terms.length === 0) return true;
				const name = model.name.toLowerCase();
				return terms.some((term) => name.includes(term.toLowerCase()));
			});
		},
		[chosenSet, flatModels, parseQuery],
	);

	const filteredModels = useMemo((): GroupedItems[] => {
		const filtered = filterModels(deferredInputValue);
		const grouped: Record<string, ParticipantModelDTO[]> = {};
		for (const model of filtered) {
			grouped[model.provider] ??= [];
			grouped[model.provider].push(model);
		}

		return Object.entries(grouped).map(([provider, items]) => ({
			label: provider,
			items,
		}));
	}, [deferredInputValue, filterModels]);

	return {
		filteredModels,
		isDeferring,
		isFreeModels: useFreeModels,
	};
}
