import { type DomainError, ValueObject } from "@briom/libs/drimion";

import type { ParticipantModelAi } from "./participant-model.ai";
import type { ParticipantModelProvider } from "./participant-model.provider";

interface ParticipantModelProps {
	model: ParticipantModelAi;
	provider: ParticipantModelProvider;
}

/**
 * @description
 * ParticipantModel — Value Object
 *
 * Represents the AI model configuration for a participant. Immutable and
 * identity-less: changing the model or provider creates a different ParticipantModel,
 * though the Participant entity itself retains its ID.
 *
 * **Why a Value Object?**
 * The combination of provider + model fully defines the capability. There is no
 * meaningful lifecycle or identity beyond these two properties.
 */
export class ParticipantModel extends ValueObject<ParticipantModelProps> {
	private constructor(props: ParticipantModelProps) {
		super(props);
	}

	/**
	 * @description
	 * Base validation — currently permissive as provider/model strings
	 * are validated at invitation time by the application layer.
	 */
	public static override isValidProps(
		_props: unknown,
	): DomainError | undefined {
		return undefined;
	}

	/**
	 * @description
	 * Rehydrates from persistence.
	 */
	public static rehydrate(props: ParticipantModelProps): ParticipantModel {
		return new ParticipantModel(props);
	}

	/**
	 * @description
	 * The AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
	 */
	public get model(): ParticipantModelAi {
		return this.props.model;
	}

	/**
	 * @description
	 * The model provider (e.g., "openai", "anthropic").
	 */
	public get provider(): ParticipantModelProvider {
		return this.props.provider;
	}

	/**
	 * @description
	 * Returns fully qualified model string for LLM gateway calls.
	 *
	 * @returns `{provider}/{model}` format
	 */
	public qualify(): string {
		return `${this.get("provider")}/${this.get("model")}`;
	}
}
