import { type DomainError, ValueObject } from "@briom/libs/drimion";

import type { ParticipantModelAi } from "./participant-model.ai";
import type { ParticipantModelProvider } from "./participant-model.provider";

interface ParticipantModelProps {
	model: ParticipantModelAi;
	provider: ParticipantModelProvider;
}

export class ParticipantModel extends ValueObject<ParticipantModelProps> {
	private constructor(props: ParticipantModelProps) {
		super(props);
	}

	public static override isValidProps(
		_props: unknown,
	): DomainError | undefined {
		return /* NO-OP */;
	}

	public get model(): ParticipantModelAi {
		return this.props.model;
	}

	public get provider(): ParticipantModelProvider {
		return this.props.provider;
	}

	public qualify(): string {
		return `${this.get("provider")}/${this.get("model")}`;
	}
}
