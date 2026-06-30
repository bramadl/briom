import {
	Entity,
	type IResult,
	Result,
	validator as v,
} from "@briom/libs/drimion";

import { EmptyDisplayNameError } from "./errors";
import type { ParticipantModel } from "./models";
import type { ParticipantId } from "./participant.id";

interface ParticipantProps {
	/**
	 * @description
	 * Human-readable name shown in the room.
	 * e.g. "Claude", "GPT-4o".
	 */
	displayName: string;

	/**
	 * @description
	 * Stable branded type identity.
	 */
	id: ParticipantId;

	/**
	 * @description
	 * The AI model powering this participant.
	 */
	model: ParticipantModel;
}

/**
 * @description
 * An AI model invited into a Room to participate in deliberation.
 *
 * Identity is stable across the deliberation — a Participant can be
 * renamed without becoming a different conceptual voice in the room.
 *
 * Participants are always loaded through their Room;
 * they hold no reference back.
 */
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
	}

	/**
	 * @description
	 * Human-readable name shown in the room UI.
	 */
	public get displayName(): string {
		return this.get("displayName");
	}

	/**
	 * @description
	 * `{provider}/{model}` string for LLM gateway calls.
	 */
	public get qualifiedModel(): string {
		return this.get("model").qualify();
	}

	/**
	 * @description
	 * Gives the participant a new display name.
	 */
	public rename(newName: string): IResult<void, EmptyDisplayNameError> {
		if (v.string(newName).isEmpty()) {
			return Result.error(new EmptyDisplayNameError());
		}

		this.change("displayName", newName);
		return Result.success(undefined);
	}
}
