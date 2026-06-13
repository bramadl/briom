import {
	type AiModel,
	type AiProvider,
	QualifiedModel,
} from "@briom/domain/ai";
import type { RoomId } from "@briom/domain/room";
import { Entity, validator as v } from "@briom/drimion";
import { EmptyFieldError } from "@briom/shared/errors";

import type { ParticipantId } from "./participant-id";

interface ParticipantProps {
	displayName: string;
	id: ParticipantId;
	model: AiModel;
	provider: AiProvider;
	roomId: RoomId;
}

export class Participant extends Entity<ParticipantProps> {
	public static isValidProps(
		props: ParticipantProps,
	): EmptyFieldError | undefined {
		if (v.string(props.displayName).isEmpty()) {
			return new EmptyFieldError({
				context: Participant.name,
				field: "displayName",
			});
		}

		if (v.string(props.model).isEmpty()) {
			return new EmptyFieldError({
				context: Participant.name,
				field: "model",
			});
		}
	}

	public get qualifiedModel(): QualifiedModel {
		return QualifiedModel(`${this.get("provider")}/${this.get("model")}`);
	}
}
