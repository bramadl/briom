import type { RoomId } from "@briom/domain/room";
import { Entity, validator as v } from "@briom/drimion";

import { EmptyContentError, NegativeSequenceError } from "./errors";
import type { Intent } from "./intent/intent";
import type { TurnAuthor } from "./turn-author";
import type { TurnId } from "./turn-id";
import type { TurnStatus } from "./turn-status";

interface TurnProps {
	author: TurnAuthor;
	content: string;
	createdAt: Date;
	id: TurnId;
	intent?: Intent;
	roomId: RoomId;
	sequenceNumber: number;
	status: TurnStatus;
}

export class Turn extends Entity<TurnProps> {
	public static isValidProps(
		props: TurnProps,
	): EmptyContentError | NegativeSequenceError | undefined {
		if (props.status !== "pending" && v.string(props.content).isEmpty()) {
			return new EmptyContentError();
		}

		if (v.number(props.sequenceNumber).isNegative()) {
			return new NegativeSequenceError();
		}
	}

	get isFromParticipant(): boolean {
		return this.get("author").type === "participant";
	}

	get isFromUser(): boolean {
		return this.get("author").type === "user";
	}

	get isPending(): boolean {
		return this.get("status") === "pending";
	}

	get isSettled(): boolean {
		return this.get("status") === "settled";
	}

	get isFailed(): boolean {
		return this.get("status") === "failed";
	}
}
