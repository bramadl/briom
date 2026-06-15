import type { RoomNotFoundError } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type AddUserMessageInput = {
	roomId: string;
	content: string;
};

export type AddUserMessageErrors = RoomNotFoundError | DomainError;
export type AddUserMessageOutput = {
	turnId: string;
};

export class AddUserMessageCommand {
	constructor(public readonly input: AddUserMessageInput) {}
}
