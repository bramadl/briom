import {
	type AiModel,
	type AiProvider,
	QualifiedModel,
} from "@briom/domain/ai";
import type { RoomId } from "@briom/domain/room";
import { Entity, validator as v } from "@briom/drimion";

import { EmptyDisplayNameError } from "./empty-display-name.error";
import { EmptyModelError } from "./empty-model.error";
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
	): EmptyModelError | EmptyDisplayNameError | undefined {
		if (v.string(props.model).isEmpty()) return new EmptyModelError();
		if (v.string(props.displayName).isEmpty()) {
			return new EmptyDisplayNameError();
		}
	}

	public get qualifiedModel(): QualifiedModel {
		return QualifiedModel(`${this.get("provider")}/${this.get("model")}`);
	}
}
