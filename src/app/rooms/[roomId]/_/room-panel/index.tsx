import type { RoomDTO } from "@briom/app/queries/get-room/query.dto";
import { Separator } from "@briom/ui/separator";

import { PARTICIPANT_COLORS } from "../mappings/participant-colors.map";
import { ParticipantInfo } from "./participant-info";
import { RoomInfo } from "./room-info";

interface RoomPanelProps {
  room: RoomDTO;
}

export function RoomPanel({ room }: RoomPanelProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-l border-border/50 lg:flex flex-col overflow-y-auto">
      <ParticipantInfo
        colorsMap={PARTICIPANT_COLORS.map((c) => c.dot)}
        participants={room.participants}
      />
      <Separator className="opacity-50" />
      <RoomInfo room={room} />
    </aside>
  );
}
