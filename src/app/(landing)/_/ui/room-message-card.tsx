import { Badge } from "@briom/ui/badge";
import { cn } from "@briom/utils";

import {
  INTENT_LABEL,
  type MockTurn,
  PARTICIPANT_COLORS,
  USER_COLOR,
} from "../data/room-preview.data";

interface RoomMessageCardProps {
  className?: string;
  turn: MockTurn;
}

export function RoomMessageCard({ turn, className }: RoomMessageCardProps) {
  const color = turn.isUser
    ? USER_COLOR
    : PARTICIPANT_COLORS[turn.colorIndex % PARTICIPANT_COLORS.length];

  const intentLabel = turn.intent ? INTENT_LABEL[turn.intent] : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        turn.isUser && "max-w-md ml-auto",
        className,
      )}
    >
      <div
        className={cn(
          "relative py-1",
          turn.isUser
            ? "bg-muted/50 p-4 rounded-lg"
            : cn("pl-4 border-l-2", color.border),
        )}
      >
        <div className="flex flex-col mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-sm font-medium font-serif", color.text)}>
              {turn.displayName}
            </span>
            {intentLabel && (
              <Badge
                className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono"
                variant="outline"
              >
                {intentLabel}
              </Badge>
            )}
          </div>
          {!turn.isUser && turn.provider && (
            <span className="text-xs text-muted-foreground">
              {turn.provider}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">
          {turn.content}
        </p>
      </div>
    </div>
  );
}
