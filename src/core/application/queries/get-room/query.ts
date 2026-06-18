import type { RoomDTO } from "../../contracts/room.dto";

export interface GetRoomInput {
	roomId: string;
}

export interface GetRoomOutput {
	room: RoomDTO;
}

export interface GetRoomQuery {
	execute(input: GetRoomInput): Promise<GetRoomOutput>;
}
