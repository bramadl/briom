"use client";

import type { TurnProposalDTO } from "@briom/app";
import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useParams } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";

import { ModeratorTurn } from "./_/moderator-turn";
import { ParticipantTurn } from "./_/participant-turn/participant-turn";
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

	const [expandedTurnId, setExpandedTurnId] = useState<string | null>(null);
	const lastSettledParticipantTurnId = useMemo(() => {
		return (
			[...turns]
				.reverse()
				.find(
					(t) =>
						t.author.type === "participant" &&
						(t.status === "settled" || t.status === "failed"),
				)?.id ?? null
		);
	}, [turns]);

	useEffect(() => {
		if (!lastSettledParticipantTurnId) return;
		setExpandedTurnId(lastSettledParticipantTurnId);
	}, [lastSettledParticipantTurnId]);

	const { participantByName, lastProgressedTurnId } = useMemo(() => {
		const byName = new Map<string, (typeof room.participants)[0]>();
		for (const p of room.participants) {
			byName.set(p.name, p);
		}

		const lastProgressed = [...turns]
			.reverse()
			.find(
				(t) =>
					t.status === "settled" ||
					t.status === "streaming" ||
					t.status === "pending" ||
					t.status === "failed",
			);

		return {
			participantByName: byName,
			lastProgressedTurnId: lastProgressed?.id ?? null,
		};
	}, [room.participants, turns]);

	return (
		<div className="w-full max-w-3xl mx-auto md:px-8 flex flex-col gap-12 lg:gap-16 min-w-0">
			{turns.map((turn) => {
				const participant =
					participantByName.get(turn.author.profile?.displayName ?? "") ??
					room.participants[0];

				if (turn.author.type === "moderator") {
					return <ModeratorTurn key={turn.id} turn={turn} />;
				}

				const isRetryable =
					room.status === "deliberating" &&
					turn.status === "failed" &&
					(lastProgressedTurnId === null || lastProgressedTurnId === turn.id);

				return (
					<ParticipantTurn
						isExpanded={expandedTurnId === turn.id}
						isRetryable={isRetryable}
						key={turn.id}
						onToggleExpand={() =>
							setExpandedTurnId((prev) => (prev === turn.id ? null : turn.id))
						}
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
