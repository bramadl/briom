import { Button } from "@briom/components/ui/button";
import type { ParticipantDTO } from "@briom/core/application";
import { Plus } from "lucide-react";

interface ParticipantInfoProps {
	colorsMap: string[];
	participants: ParticipantDTO[];
}

export function ParticipantInfo({
	colorsMap,
	participants,
}: ParticipantInfoProps) {
	return (
		<div className="p-4 space-y-3">
			<header className="flex items-center justify-between gap-4">
				<h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
					Participants ({participants.length})
				</h3>
				<Button size="icon-xs" variant="ghost">
					<Plus className="text-muted-foreground" />
				</Button>
			</header>
			<ul className="space-y-3">
				{participants.map((p, i) => (
					<li className="flex items-center gap-2.5" key={p.id}>
						<span
							className={`w-2 h-2 rounded-full shrink-0 ${colorsMap[i % colorsMap.length]}`}
						/>
						<div className="min-w-0">
							<p className="text-sm text-foreground truncate">
								{p.displayName}
							</p>
							<p className="text-[10px] text-muted-foreground/60 font-mono truncate">
								{p.provider}/{p.model}
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
