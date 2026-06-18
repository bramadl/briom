import type { RoomContext } from "./contexts/room.context";
import type { TurnContext } from "./contexts/turn.context";

export interface BriomDeps {
	rooms: RoomContext;
	turns: TurnContext;
}

export class Briom {
	public constructor(private readonly deps: BriomDeps) {}

	public rooms() {
		return this.deps.rooms;
	}

	public turns() {
		return this.deps.turns;
	}
}
