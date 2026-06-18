import type { RoomOverviewDTO } from "../../contracts/room.dto";

export interface GetRoomsInput {
	moderatorId: string;
}

export interface GetRoomsOutput {
	count: number;
	rooms: RoomOverviewDTO[];
}

export interface GetRoomsQuery {
	execute(input: GetRoomsInput): Promise<GetRoomsOutput>;
}
