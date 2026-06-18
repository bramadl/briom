import type { TurnDTO } from "../../contracts/turn.dto";

export interface GetTurnsByRoomInput {
	roomId: string;
}

export interface GetTurnsByRoomOutput {
	turns: TurnDTO[];
}

export interface GetTurnsByRoomQuery {
	execute(input: GetTurnsByRoomInput): Promise<GetTurnsByRoomOutput>;
}
