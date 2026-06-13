import type { Room } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type CreateRoomInput = {
	title: string;
};

export type CreateRoomErrors = DomainError;
export type CreateRoomOutput = Room;

export class CreateRoomCommand {
	constructor(public readonly input: CreateRoomInput) {}
}
