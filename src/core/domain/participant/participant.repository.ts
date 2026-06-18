import type { Room } from "../room";

import type { Participant } from "./participant";
import type { ParticipantId } from "./participant.id";

export interface ParticipantRepository {
	findById(id: ParticipantId): Promise<Participant | null>;
	findByRoom(room: Room): Promise<Participant[]>;
	persist(participant: Participant): Promise<void>;
}
