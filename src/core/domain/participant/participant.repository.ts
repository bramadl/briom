import type { RoomId } from "../room";

import type { Participant } from "./participant";
import type { ParticipantId } from "./participant.id";

export interface ParticipantRepository {
	findById(id: ParticipantId): Promise<Participant | null>;
	findByRoom(roomId: RoomId): Promise<Participant[]>;
	persist(participant: Participant): Promise<void>;
}
