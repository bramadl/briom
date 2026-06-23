"use client";

import type { RoomDTO } from "@briom/app";
import { useRoom } from "@briom/rooms/_/room/queries/data/use-room";
import { useParams } from "next/navigation";
import { memo } from "react";

import { ModeratorTurn } from "./_/moderator-turn";
import { ParticipantTurn } from "./_/participant-turn";
import { TurnProposals } from "./_/turn-proposals";

function TurnSequenceComponent() {
	const { roomId } = useParams<{ roomId: string }>();
	const { turns, multiDeliberation, room } = useRoom(roomId);

	const lastParticipantTurn = [...turns]
		.reverse()
		.find((t) => t.author.type === "participant");

	const showProposals =
		multiDeliberation && lastParticipantTurn?.status === "settled";

	return (
		<div className="w-full max-w-3xl mx-auto px-8 flex flex-col gap-10">
			{turns.map((turn) =>
				turn.author.type === "moderator" ? (
					<ModeratorTurn key={turn.id} turn={turn} />
				) : (
					<ParticipantTurn
						isLastTurn={lastParticipantTurn?.id === turn.id}
						key={turn.id}
						participant={
							room.participants.find(
								(p) => p.id === turn.author.participantId,
							) as RoomDTO["participants"][number]
						}
						showIntent={multiDeliberation}
						turn={turn}
					/>
				),
			)}
			{showProposals && <TurnProposals act={() => {}} proposals={[]} />}
		</div>
	);
}

export const TurnSequence = memo(TurnSequenceComponent);
