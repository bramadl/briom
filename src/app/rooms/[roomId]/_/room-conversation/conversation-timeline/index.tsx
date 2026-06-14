import type { ParticipantDTO, TurnDTO } from "@briom/core/application";

import { ConversationMessage } from "../conversation-message";
import { SuggestionBubbles } from "../suggestion-bubbles";
import { useCallback, useEffect, useRef } from "react";

interface ConversationTimelineProps {
  generating?: boolean;
  onSuggestionSelected: (participantId: string, intent: string) => void;
  participants: ParticipantDTO[];
  turns: TurnDTO[];
}

export function ConversationTimeline({
  turns,
  generating,
  participants,
  onSuggestionSelected,
}: ConversationTimelineProps) {
  const participantIndexMap = new Map(participants.map((p, i) => [p.id, i]));
  const lastTurn = turns.at(-1);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [generating]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 px-8 md:px-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 md:gap-6">
        {turns.map((turn) => {
          const participant = participants.find(
            (p) => p.id === turn.participantId,
          );

          const participantIndex = turn.participantId
            ? (participantIndexMap.get(turn.participantId) ?? 0)
            : 0;

          return (
            <ConversationMessage
              isLatestTurn={turn.id === lastTurn?.id}
              key={turn.id}
              participant={participant}
              participantIndex={participantIndex}
              turn={turn}
            />
          );
        })}

        {generating && (
          <div className="pl-4 border-l-2 border-l-primary/30 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50 font-mono animate-pulse">
                thinking...
              </span>
            </div>
          </div>
        )}

        {lastTurn && !generating && (
          <SuggestionBubbles
            lastTurn={lastTurn}
            onSelect={onSuggestionSelected}
            participants={participants}
          />
        )}
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
