import type { RoomStatusOption } from "@briom/core/domain";

export interface RoomDTO {
	createdAt: string;
	id: string;
	moderatorId: string;
	participantIds: string[];
	status: RoomStatusOption;
	title: string;
	topic: string | null;
	turnIds: string[];
}

export interface GetRoomInput {
	roomId: string;
}

export interface GetRoomOutput {
	room: RoomDTO;
}

export interface GetRoomQuery {
	execute(input: GetRoomInput): Promise<GetRoomOutput>;
}
