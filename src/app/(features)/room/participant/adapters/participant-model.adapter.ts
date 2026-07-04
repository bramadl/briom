import type { Model } from "@openrouter/sdk/models";

/**
 * @description
 * Simplified, UI-facing model shape. Deliberately decoupled from
 * OpenRouter's raw `Model` type — the SDK response has a bunch of fields
 * (architecture, pricing breakdown, tokenizer, etc.) the picker doesn't
 * need, and none of it (`isFree`, `provider`) exists as a direct field
 * on the wire. Keeping a small adapter here means:
 *
 * 1. UI components never touch OpenRouter's shape directly, so an SDK
 *    version bump changing `Model` only requires updating this one file.
 * 2. "Is this free?" and "who's the provider?" logic lives in exactly
 *    one place, instead of being re-derived ad-hoc wherever a model is
 *    rendered.
 */
export interface ParticipantModel {
	/**
	 * @description
	 * OpenRouter's model id, e.g. "anthropic/claude-3.5-sonnet". This is
	 * what gets stored in the form's `participants[].model` field, and
	 * what `isSelected` matching is keyed on.
	 */
	id: string;

	/**
	 * @description
	 * True when both prompt and completion pricing are zero. OpenRouter
	 * encodes pricing as decimal strings (e.g. "0", "0.000003"), not
	 * numbers or booleans, so this needs explicit parsing rather than a
	 * truthiness check.
	 */
	isFree: boolean;

	/**
	 * @description
	 * Display name, e.g. "Claude 3.5 Sonnet".
	 */
	name: string;

	/**
	 * @description
	 * Derived from the `provider/slug` shape of `id`. OpenRouter doesn't
	 * expose this as its own field — `topProvider` on the raw model
	 * describes routing/limits info, not the vendor name, so it's not a
	 * reliable substitute.
	 */
	provider: string;
}

function isPriceFree(price: string | undefined): boolean {
	if (!price) return true;
	const parsed = Number.parseFloat(price);
	return Number.isNaN(parsed) || parsed === 0;
}

function deriveProvider(id: string): string {
	const [provider] = id.split("/");
	return provider ?? id;
}

export function toParticipantModel(model: Model): ParticipantModel {
	return {
		id: model.id,
		isFree:
			isPriceFree(model.pricing.prompt) &&
			isPriceFree(model.pricing.completion),
		name: model.name,
		provider: deriveProvider(model.id),
	};
}
