import type { Model } from "@openrouter/sdk/models";

export interface ParticipantModel {
	id: string;
	isFree: boolean;
	model: string;
	name: string;
	provider: string;
}

function isPriceFree(price: string | undefined): boolean {
	if (!price) return true;
	const parsed = Number.parseFloat(price);
	return Number.isNaN(parsed) || parsed === 0;
}

function deriveProvider(id: string): [string, string] {
	const [provider, modelName] = id.split("/");
	return [provider ?? id, modelName];
}

export function toParticipantModel(model: Model): ParticipantModel {
	const [provider, modelName] = deriveProvider(model.id);
	return {
		id: model.id,
		isFree:
			isPriceFree(model.pricing.prompt) &&
			isPriceFree(model.pricing.completion),
		name: model.name,
		model: modelName,
		provider: provider,
	};
}
