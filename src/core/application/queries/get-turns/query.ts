import type { TurnDTO } from "../../contracts/turn.dto";

export interface GetTurnsInput {
	roomId: string;
}

export interface GetTurnsOutput {
	turns: TurnDTO[];
}

export interface GetTurnsQuery {
	execute(input: GetTurnsInput): Promise<GetTurnsOutput>;
}
