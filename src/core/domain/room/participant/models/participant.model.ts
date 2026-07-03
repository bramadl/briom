import { ValueObject } from "@drimion";

import type { ParticipantModelAi } from "./participant-model.ai";
import type { ParticipantModelProvider } from "./participant-model.provider";

interface ParticipantModelProps {
	/**
	 * @description
	 * The AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
	 */
	model: ParticipantModelAi;

	/**
	 * @description
	 * The model provider (e.g., "openai", "anthropic").
	 */
	provider: ParticipantModelProvider;
}

/**
 * @description
 * The AI model powering a Participant.
 */
export class ParticipantModel extends ValueObject<ParticipantModelProps> {
	private constructor(props: ParticipantModelProps) {
		super(props);
	}

	public static override isValidProps(
		_props: ParticipantModelProps,
	): undefined {
		return /** `provider/model` strings trusted from `Provider`. */ undefined;
	}

	/**
	 * @description
	 * The AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
	 */
	public get model(): ParticipantModelAi {
		return this.get("model");
	}

	/**
	 * @description
	 * The model provider (e.g., "openai", "anthropic").
	 */
	public get provider(): ParticipantModelProvider {
		return this.get("provider");
	}

	/**
	 * @description
	 * Returns `{provider}/{model}` for LLM gateway calls.
	 */
	public qualify(): string {
		return `${this.get("provider")}/${this.get("model")}`;
	}
}
