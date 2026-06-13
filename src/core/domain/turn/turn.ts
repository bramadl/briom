import type { RoomId } from "@briom/domain/room";
import { DomainError, Entity, validator as v } from "@briom/drimion";
import { EmptyFieldError } from "@briom/shared/errors";

import type { Intent } from "./intent/intent";
import type { TurnAuthor } from "./turn-author";
import type { TurnId } from "./turn-id";

interface TurnProps {
	author: TurnAuthor;
	content: string;
	createdAt: Date;
	id: TurnId;
	intent?: Intent;
	roomId: RoomId;
	sequenceNumber: number;
}

export class Turn extends Entity<TurnProps> {
	public static isValidProps(props: TurnProps): DomainError | undefined {
		if (v.string(props.content).isEmpty()) {
			return new EmptyFieldError({ context: Turn.name, field: "content" });
		}

		if (v.number(props.sequenceNumber).isNegative()) {
			return new DomainError("sequence number cannot be negative", {
				context: Turn.name,
				field: "sequenceNumber",
			});
		}
	}

	get isFromParticipant(): boolean {
		return this.get("author").type === "participant";
	}

	get isFromUser(): boolean {
		return this.get("author").type === "user";
	}
}
