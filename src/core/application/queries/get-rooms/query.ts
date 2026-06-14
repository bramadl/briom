import type { RoomSummaryDTO } from "./query.dto";

export type GetRoomsInput = never;

export type GetRoomsErrors = never;
export type GetRoomsOutput = {
	rooms: RoomSummaryDTO[];
};

export class GetRoomsQuery {
	public constructor(public readonly input: GetRoomsInput) {}
}
