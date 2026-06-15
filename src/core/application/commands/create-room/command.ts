import type { DomainError } from "@briom/drimion";

export type CreateRoomInput = {
	title: string;
};

export type CreateRoomErrors = DomainError;
export type CreateRoomOutput = {
	roomId: string;
};

export class CreateRoomCommand {
	constructor(public readonly input: CreateRoomInput) {}
}
