import { Entity, type IResult, Result, validator as v } from "@briom/drimion";

import type { RoomId } from "../room.id";

import { EmptyDisplayNameError } from "./errors";
import type { ParticipantModel } from "./models";
import type { ParticipantId } from "./participant.id";

interface ParticipantProps {
	displayName: string;
	id: ParticipantId;
	model: ParticipantModel;
	roomId: RoomId;
}

/**
 * @description
 * `Participant` — Entity
 *
 * An invited AI model within a `Room`. Participants have identity (they are Entities,
 * not Value Objects) because they maintain a stable presence across the deliberation
 * and can be renamed without becoming a different conceptual participant.
 *
 * **Ubiquitous Language**
 * - `Participant`: AI model yang di-invite ke room (NOT "bot", "agent", "user")
 * - `DisplayName`: Human-readable identifier within the room (e.g., "Claude", "GPT-4")
 * - `Model`: The actual AI model identifier (e.g., "anthropic/claude-3.5-sonnet")
 *
 * **Identity**
 * Two participants are equal only if they share the same ID. A participant can be
 * renamed (change displayName) while preserving its identity and turn history.
 */
export class Participant extends Entity<ParticipantProps> {
	private constructor(props: ParticipantProps) {
		super(props);
	}

	/**
	 * @description
	 * Validates that display name is non-empty.
	 */
	public static override isValidProps(
		props: ParticipantProps,
	): EmptyDisplayNameError | undefined {
		if (v.string(props.displayName).isEmpty()) {
			return new EmptyDisplayNameError();
		}
		return undefined;
	}

	/**
	 * @description
	 * Rehydrates from persistence. Does not emit events.
	 */
	public static rehydrate(props: ParticipantProps): Participant {
		return new Participant(props);
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
	 * Fully qualified model identifier for LLM gateway calls.
	 * Format: `{provider}/{model}` (e.g., "openai/gpt-4", "anthropic/claude-3.5-sonnet")
	 */
	public get qualifiedModel(): string {
		return this.get("model").qualify();
	}

	/**
	 * @description
	 * Renames the participant with a new display name.
	 *
	 * **Invariant**: New name must be non-empty.
	 *
	 * @param newName - The new display name
	 * @returns Result containing the updated `Participant` or `EmptyDisplayNameError`
	 */
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
