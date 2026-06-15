import type { RoomNotFoundError } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

import type { RoomDTO } from "./query.dto";

export type GetRoomInput = {
	roomId: string;
};

export type GetRoomErrors = RoomNotFoundError | DomainError;
export type GetRoomOutput = RoomDTO;

export class GetRoomQuery {
	constructor(public readonly input: GetRoomInput) {}
}
