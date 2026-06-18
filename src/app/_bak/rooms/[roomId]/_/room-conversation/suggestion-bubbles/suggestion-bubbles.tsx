"use client";

import type {
	ParticipantDTO,
	TurnDTO,
} from "@briom/core/application/_bak/queries/get-room/query.dto";
import { gsap, registerGsap } from "@briom/libs/next/gsap/register";
import { Button } from "@briom/ui/button";
import { useGSAP } from "@gsap/react";
import { useMemo, useRef } from "react";

import { SUGGESTED_INTENTS } from "./suggested-intents";
import { seededRandom, shuffleWithSeed } from "./suggestion.utils";

interface SuggestionBubblesProps {
	lastTurn: TurnDTO;
	onSelect: (participantId: string, intent: string) => void;
	participants: ParticipantDTO[];
}

export function SuggestionBubbles({
	lastTurn,
	participants,
	onSelect,
}: SuggestionBubblesProps) {
	const rootRef = useRef<HTMLDivElement>(null);

	const otherParticipants = useMemo(
		() => participants.filter((p) => p.id !== lastTurn.participantId),
		[participants, lastTurn.participantId],
	);

	const shouldRender =
		lastTurn.role === "participant" && otherParticipants.length > 0;

	const suggestions = useMemo(() => {
		if (!shouldRender) return [];

		const seed = `${lastTurn.id}-${lastTurn.participantId}`;

		const shuffledIntents = shuffleWithSeed(
			SUGGESTED_INTENTS,
			`${seed}-intents`,
		);

		const shuffledParticipants = shuffleWithSeed(
			otherParticipants,
			`${seed}-participants`,
		);

		const maxPossible = otherParticipants.length * SUGGESTED_INTENTS.length;
		const count = Math.min(
			4,
			Math.max(1, Math.floor(seededRandom(`${seed}-count`) * 4) + 1),
			maxPossible,
		);

		const picks: Array<{
			act: string;
			key: string;
			model: string;
			participant: ParticipantDTO;
		}> = [];

		const usedKeys = new Set<string>();

		let attempts = 0;
		while (picks.length < count && attempts < count * 10) {
			attempts++;

			const pIndex = Math.floor(
				seededRandom(`${seed}-p${attempts}`) * shuffledParticipants.length,
			);

			const iIndex = Math.floor(
				seededRandom(`${seed}-i${attempts}`) * shuffledIntents.length,
			);

			const participant = shuffledParticipants[pIndex];
			const intent = shuffledIntents[iIndex];
			const key = `${participant.id}-${intent}`;

			if (usedKeys.has(key)) continue;

			usedKeys.add(key);
			picks.push({
				act: intent,
				key,
				model: participant.displayName,
				participant,
			});
		}

		return picks;
	}, [lastTurn.id, lastTurn.participantId, otherParticipants, shouldRender]);

	useGSAP(
		() => {
			if (!shouldRender || suggestions.length === 0 || !rootRef.current) return;
			registerGsap();
			gsap.to("[data-suggestion]", {
				opacity: 1,
				y: 0,
				duration: 0.4,
				stagger: 0.06,
				ease: "power2.out",
			});
		},
		{
			dependencies: [lastTurn.id, shouldRender, suggestions.length],
			revertOnUpdate: true,
		},
	);

	if (!shouldRender) return null;
	if (suggestions.length === 0) return null;

	return (
		<div className="flex flex-col items-end gap-1.5" ref={rootRef}>
			<span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono">
				continue the discussion
			</span>
			<div className="flex flex-wrap justify-end gap-1.5">
				{suggestions.map(({ act, key, model, participant }) => (
					<Button
						className="h-7 text-xs rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all font-normal opacity-0 translate-y-3"
						data-suggestion
						key={key}
						onClick={() => onSelect(participant.id, act)}
						size="sm"
						variant="outline"
					>
						Ask{" "}
						<span className="text-foreground/80 font-medium mx-0.5">
							{model}
						</span>{" "}
						to{" "}
						<span className="text-foreground/80 font-medium ml-0.5">{act}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
