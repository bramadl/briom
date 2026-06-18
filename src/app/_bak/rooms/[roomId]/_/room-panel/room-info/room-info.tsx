import type { RoomDTO } from "@briom/core/application/_bak";
import { format, parseISO } from "date-fns";

interface RoomInfoProps {
	room: RoomDTO;
}

export function RoomInfo({ room }: RoomInfoProps) {
	const turnCount = room.turns.length;
	const userTurns = room.turns.filter((t) => t.role === "user").length;
	const aiTurns = turnCount - userTurns;

	return (
		<div className="p-4 space-y-3">
			<h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
				Room Info
			</h3>
			<dl className="space-y-2">
				<div className="flex justify-between items-baseline">
					<dt className="text-[11px] text-muted-foreground">Created</dt>
					<dd className="text-[11px] text-foreground/70 font-mono">
						{format(parseISO(room.createdAt), "MMM d, yyyy")}
					</dd>
				</div>
				<div className="flex justify-between items-baseline">
					<dt className="text-[11px] text-muted-foreground">Total turns</dt>
					<dd className="text-[11px] text-foreground/70 font-mono">
						{turnCount}
					</dd>
				</div>
				<div className="flex justify-between items-baseline">
					<dt className="text-[11px] text-muted-foreground">Your turns</dt>
					<dd className="text-[11px] text-foreground/70 font-mono">
						{userTurns}
					</dd>
				</div>
				<div className="flex justify-between items-baseline">
					<dt className="text-[11px] text-muted-foreground">AI turns</dt>
					<dd className="text-[11px] text-foreground/70 font-mono">
						{aiTurns}
					</dd>
				</div>
			</dl>
		</div>
	);
}
