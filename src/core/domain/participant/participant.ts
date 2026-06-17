import { Entity, type IResult, Result, validator as v } from "@briom/drimion";

import type { RoomId } from "../room";

import { EmptyDisplayNameError } from "./errors";
import type { ParticipantModel } from "./models";
import type { ParticipantId } from "./participant.id";

interface ParticipantProps {
	displayName: string;
	id: ParticipantId;
	model: ParticipantModel;
	roomId: RoomId;
}

export class Participant extends Entity<ParticipantProps> {
	private constructor(props: ParticipantProps) {
		super(props);
	}

	public static override isValidProps(
		props: ParticipantProps,
	): EmptyDisplayNameError | undefined {
		if (v.string(props.displayName).isEmpty()) {
			return new EmptyDisplayNameError();
		}
		return undefined;
	}

	public get displayName(): string {
		return this.get("displayName");
	}

	public get qualifiedModel(): string {
		return this.get("model").qualify();
	}

	public rename(newName: string): IResult<Participant, EmptyDisplayNameError> {
		const validation = Participant.isValidProps({
			...this.toObject(),
			displayName: newName,
		} as ParticipantProps);

		if (validation) return Result.error(validation);

		this.change("displayName", newName);
		return Result.success(this);
	}
}
