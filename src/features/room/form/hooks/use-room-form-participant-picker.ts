import {
	type ParticipantModel,
	toParticipantModel,
} from "@briom/room/participant/adapters/participant-model.adapter";
import { useParticipantModels } from "@briom/room/participant/hooks/use-participant-models";
import { FEATURED_MODEL_IDS } from "@briom/room/participant/settings/model-ranking";
import { useCallback, useDeferredValue, useMemo, useState } from "react";

import type { RoomFormParticipantSchema } from "../schema/schema";

function sortParticipantModels(models: ParticipantModel[]): ParticipantModel[] {
	return [...models].sort((a, b) => {
		const featuredDiff = Number(isFeatured(b)) - Number(isFeatured(a));
		if (featuredDiff !== 0) return featuredDiff;

		const freeDiff = Number(b.isFree) - Number(a.isFree);
		if (freeDiff !== 0) return freeDiff;

		return a.name.localeCompare(b.name);
	});
}

function parseModelQuery(rawQuery: string): {
	freeOnly: boolean;
	text: string;
} {
	const trimmed = rawQuery.trim();
	const freeOnly = /^@free\b/i.test(trimmed);

	const text = trimmed
		.replace(/^@free\b/i, "")
		.trim()
		.toLowerCase();

	return { freeOnly, text };
}

function filterParticipantModels(
	models: ParticipantModel[],
	rawQuery: string,
): ParticipantModel[] {
	const { freeOnly, text } = parseModelQuery(rawQuery);

	return models.filter((model) => {
		if (freeOnly && !model.isFree) return false;
		if (!text) return true;

		return (
			model.name.toLowerCase().includes(text) ||
			model.provider.toLowerCase().includes(text) ||
			model.id.toLowerCase().includes(text)
		);
	});
}

function isFeatured(model: ParticipantModel): boolean {
	return FEATURED_MODEL_IDS.has(model.id);
}

interface UseRoomParticipantPickerOptions {
	participants: RoomFormParticipantSchema;
}

export function useRoomParticipantPicker({
	participants,
}: UseRoomParticipantPickerOptions) {
	const { data, isLoading } = useParticipantModels();

	const models = useMemo<ParticipantModel[]>(() => {
		const mapped = (data?.data ?? []).map(toParticipantModel);
		return sortParticipantModels(mapped);
	}, [data]);

	const [query, setQuery] = useState("");

	const deferredQuery = useDeferredValue(query);
	const isFiltering = query !== deferredQuery;

	const filteredModels = useMemo(
		() => filterParticipantModels(models, deferredQuery),
		[models, deferredQuery],
	);

	const selectedModelIds = useMemo(
		() => new Set(participants.map((p) => `${p.provider}/${p.model}`)),
		[participants],
	);

	const isSelected = useCallback(
		(model: ParticipantModel) => selectedModelIds.has(model.id),
		[selectedModelIds],
	);

	return {
		filteredModels,
		isFeatured,
		isFiltering,
		isLoading,
		isSelected,
		query,
		setQuery,
	};
}
