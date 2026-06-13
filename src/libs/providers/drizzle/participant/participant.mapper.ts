import { AiModel, AiProvider } from "@briom/domain/ai";
import { Participant, ParticipantId } from "@briom/domain/participant";
import { RoomId } from "@briom/domain/room";

import type { ParticipantRecord } from "./participant.model";

export const ParticipantMapper = {
	toDomain(record: ParticipantRecord): Participant {
		const result = Participant.create({
			id: ParticipantId(record.id),
			roomId: RoomId(record.roomId),
			provider: AiProvider(record.provider),
			model: AiModel(record.model),
			displayName: record.displayName,
		});

		if (result.isError()) throw result.error();
		return result.value();
	},

	toPersistence(participant: Participant): ParticipantRecord {
		return {
			id: participant.id.value(),
			roomId: participant.get("roomId") as string,
			provider: participant.get("provider"),
			model: participant.get("model") as string,
			displayName: participant.get("displayName"),
		};
	},
};
