import type { Model } from "@openrouter/sdk/models";

export function filterFreeModels(model: Model[]) {
	return model.filter(
		(m) =>
			Object.values(m.pricing)
				.map(Number)
				.reduce((sum, value) => sum + value, 0) === 0,
	);
}
