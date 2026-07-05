"use client";

import { FreshRoom } from "@briom/room/deliberation/components/internal/FreshRoom";
import { useRoom } from "@briom/room/hooks/use-room";
import { ModeratorTurn } from "@briom/room/turns/components/ModeratorTurn";
import { ParticipantTurn } from "@briom/room/turns/components/ParticipantTurn";
import { TurnProposals } from "@briom/room/turns/components/TurnProposals";
import { useProposals } from "@briom/room/turns/hooks/use-proposals";
import { useMemo } from "react";

import { useStickToBottom } from "../../hooks/use-stick-to-bottom";

export function RoomSequence() {
	const { isFresh, room } = useRoom();
	const { acceptProposal, proposals, showProposals } = useProposals(room.id);

	const turns = useMemo(() => room.info.turns, [room.info.turns]);
	const participants = useMemo(
		() => room.info.participants,
		[room.info.participants],
	);

	const { containerRef } = useStickToBottom();

	if (isFresh) return <FreshRoom participants={participants} />;
	return (
		<div
			className="w-full max-w-3xl mx-auto md:px-8 flex flex-col gap-12 lg:gap-16 min-w-0"
			ref={containerRef}
		>
			{turns.map((turn) => {
				const id = turn.id;
				const isParticipantTurn = turn.author.type === "participant";

				if (isParticipantTurn) return <ParticipantTurn id={id} key={id} />;
				return (
					<ModeratorTurn
						attachments={turn.attachments.map((attachment) => ({
							mimeType: attachment.mimeType,
							name: attachment.name,
							sizeBytes: attachment.sizeBytes,
							url: attachment.url,
						}))}
						content={turn.content}
						id={id}
						key={id}
						settledAt={turn.settledAt}
					/>
				);
			})}
			{showProposals && (
				<TurnProposals onSelect={acceptProposal} proposals={proposals} />
			)}
		</div>
	);
}
