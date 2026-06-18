import type { TurnDTO } from "../../contracts/turn.dto";

export interface GetTurnInput {
	turnId: string;
}

export interface GetTurnOutput {
	turn: TurnDTO;
}

export interface GetTurnQuery {
	execute(input: GetTurnInput): Promise<GetTurnOutput>;
}
