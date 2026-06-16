import type { RoomDTO } from "./query.dto";

export type GetRoomInput = { roomId: string };

export type GetRoomOutput = RoomDTO;

export class GetRoomQuery {
	constructor(public readonly input: GetRoomInput) {}
}
