"use client";

import type {
  ParticipantDTO,
  TurnDTO,
} from "@briom/app/queries/get-room/query.dto";
import { gsap, registerGsap } from "@briom/libs/gsap/register";
import { Button } from "@briom/ui/button";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { SUGGESTED_INTENTS } from "./suggested-intents";

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
  const shouldRender =
    lastTurn.role === "participant" &&
    participants.filter((p) => p.id !== lastTurn.participantId).length > 0;

  if (lastTurn.role !== "participant") return null;
  const otherParticipants = participants.filter(
    (p) => p.id !== lastTurn.participantId,
  );

  const rootRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!shouldRender) return;
    registerGsap();
    gsap.fromTo(
      "[data-suggestion]",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
    );
  }, { scope: rootRef, dependencies: [lastTurn.id, shouldRender] });

  if (!shouldRender) return <div ref={rootRef} />;
  if (otherParticipants.length === 0) return null;

  const suggestions = otherParticipants
    .flatMap((p, pi) =>
      SUGGESTED_INTENTS.slice(0, 2).map((intent, ii) => ({
        act: SUGGESTED_INTENTS[(pi + ii) % SUGGESTED_INTENTS.length],
        intent,
        key: `${p.id}-${intent}`,
        model: p.displayName,
        participant: p,
      })),
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col items-end gap-1.5" ref={rootRef}>
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono">
        continue the discussion
      </span>
      <div className="flex flex-wrap justify-end gap-1.5">
        {suggestions.map(({ act, key, model, participant }) => (
          <Button
            className="h-7 text-xs rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all font-normal"
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
