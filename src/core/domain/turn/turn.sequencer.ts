import type { Room } from "../room";

import type { TurnSequence } from "./turn.sequence";

export interface TurnSequencer {
	nextPositionInside(room: Room): Promise<TurnSequence>;
}
