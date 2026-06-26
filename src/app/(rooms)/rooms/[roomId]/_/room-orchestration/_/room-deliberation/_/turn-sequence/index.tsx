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
	const { participantByName, lastParticipantTurn, lastProgressedTurnId } =
		useMemo(() => {
			const byName = new Map<string, (typeof room.participants)[0]>();
			for (const p of room.participants) {
				byName.set(p.name, p);
			}

			const lastParticipant = [...turns]
				.reverse()
				.find((t) => t.author.type === "participant");

			const lastProgressed = [...turns]
				.reverse()
				.find(
					(t) =>
						t.status === "settled" ||
						t.status === "streaming" ||
						t.status === "pending",
				);

			return {
				participantByName: byName,
				lastParticipantTurn: lastParticipant,
				lastProgressedTurnId: lastProgressed?.id ?? null,
			};
		}, [room.participants, turns]);

	return (
		<div className="w-full max-w-3xl mx-auto px-8 flex flex-col gap-12 lg:gap-16 min-w-0">
			{turns.map((turn) => {
				const participant =
					participantByName.get(turn.author.profile?.displayName ?? "") ??
					room.participants[0];

				if (turn.author.type === "moderator") {
					return <ModeratorTurn key={turn.id} turn={turn} />;
				}

				const isRetryable =
					turn.status === "failed" &&
					(lastProgressedTurnId === null || lastProgressedTurnId === turn.id);

				return (
					<ParticipantTurn
						isLastTurn={lastParticipantTurn?.id === turn.id}
						isRetryable={isRetryable}
						key={turn.id}
						participant={participant}
						showAbort={room.status === "deliberating"}
						showIntent={multiDeliberation}
						turn={turn}
					/>
				);
			})}
			{showProposals && (
				<TurnProposals onSelect={onProposalAccepted} proposals={proposals} />
			)}
		</div>
	);
}

export const TurnSequence = memo(TurnSequenceComponent);
