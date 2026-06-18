import type { RoomDTO } from "../get-room/query";

export interface GetRoomsInput {
	// EMPTY — no criteria yet, FE will filter/sort client-side or boundary layer adds auth
	criteria?: never;
}

export interface GetRoomsOutput {
	rooms: RoomDTO[];
}

export interface GetRoomsQuery {
	execute(input: GetRoomsInput): Promise<GetRoomsOutput>;
}
