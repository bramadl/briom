"use client";

import type { TurnProposalDTO } from "@briom/app";
import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useParams } from "next/navigation";
import { memo, useMemo } from "react";

import { ModeratorTurn } from "./_/moderator-turn";
import { ParticipantTurn } from "./_/participant-turn";
import { TurnProposals } from "./_/turn-proposals";

interface TurnSequenceProps {
	onProposalAccepted: (proposal: TurnProposalDTO) => void;
	proposals: TurnProposalDTO[];
	showProposals?: boolean;
}

function TurnSequenceComponent({
	onProposalAccepted,
	proposals,
	showProposals,
}: TurnSequenceProps) {
	const { roomId } = useParams<{ roomId: string }>();
	const { multiDeliberation, room, turns } = useRoom(roomId);

	const lastParticipantTurn = useMemo(() => {
		return [...turns].reverse().find((t) => t.author.type === "participant");
	}, [turns]);

	return (
		<div className="w-full max-w-3xl mx-auto px-8 flex flex-col gap-12 lg:gap-16 min-w-0">
			{turns.map((turn) =>
				turn.author.type === "moderator" ? (
					<ModeratorTurn key={turn.id} turn={turn} />
				) : (
					<ParticipantTurn
						isLastTurn={lastParticipantTurn?.id === turn.id}
						key={turn.id}
						participant={
							room.participants.find(
								(p) => p.name === turn.author.profile?.id,
							) ?? room.participants[0]
						}
						showAbort={room.status === "deliberating"}
						showIntent={multiDeliberation}
						turn={turn}
					/>
				),
			)}
			{showProposals && (
				<TurnProposals onSelect={onProposalAccepted} proposals={proposals} />
			)}
		</div>
	);
}

export const TurnSequence = memo(TurnSequenceComponent);
