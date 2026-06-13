import type { RoomNotFoundError } from "@briom/domain/room";
import type { Turn } from "@briom/domain/turn";
import type { DomainError } from "@briom/drimion";

export type AddUserMessageInput = {
	roomId: string;
	content: string;
};

export type AddUserMessageErrors = RoomNotFoundError | DomainError;
export type AddUserMessageOutput = Turn;

export class AddUserMessageCommand {
	constructor(public readonly input: AddUserMessageInput) {}
}
