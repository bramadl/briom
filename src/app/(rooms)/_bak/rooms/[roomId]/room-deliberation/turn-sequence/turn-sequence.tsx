"use client";

import { useRoom } from "@briom/rooms/_bak/hooks/store/use-room";

import { ModeratorTurn } from "./moderator-turn";
import { ParticipantTurn } from "./participant-turn";
import { TurnPerspectiveProposals } from "./turn-perspective";

export function TurnSequence() {
	const { turns, isMultiDeliberationRoom, room } = useRoom();

	const lastParticipantTurn = [...turns]
		.reverse()
		.find((t) => t.author.type === "participant");

	const showProposals =
		isMultiDeliberationRoom && lastParticipantTurn?.status === "settled";

	return (
		<div className="w-full max-w-3xl mx-auto px-8 flex flex-col gap-10">
			{turns.map((turn) =>
				turn.author.type === "moderator" ? (
					<ModeratorTurn key={turn.id} turn={turn} />
				) : (
					<ParticipantTurn
						isLastTurn={lastParticipantTurn?.id === turn.id}
						isMultiDeliberationRoom={isMultiDeliberationRoom}
						key={turn.id}
						participants={room.participants}
						turn={turn}
					/>
				),
			)}
			{showProposals && (
				<TurnPerspectiveProposals act={() => {}} proposals={[]} />
			)}
		</div>
	);
}
