import type { RoomId } from "@briom/domain/room";

import type { Participant } from "./participant";

export interface ParticipantRepository {
	findByRoom(roomId: RoomId): Promise<Participant[]>;
	save(participant: Participant): Promise<void>;
}
