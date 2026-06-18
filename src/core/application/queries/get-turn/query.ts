import type { TurnDTO } from "../get-turns/query";

export interface GetTurnInput {
	turnId: string;
}

export interface GetTurnOutput {
	turn: TurnDTO;
}

export interface GetTurnQuery {
	execute(input: GetTurnInput): Promise<GetTurnOutput>;
}
