import { MessageCircleIcon } from "lucide-react";

export function RoomEmpty() {
	return (
		<div className="flex-1 h-full flex flex-col items-center justify-center gap-4 px-8 py-8 text-center whitespace-nowrap">
			<div className="text-muted-foreground/40">
				<MessageCircleIcon size={20} />
			</div>
			<div className="flex flex-col gap-1.5">
				<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
					No rooms yet
				</p>
				<div className="flex flex-col gap-0.5">
					<h3 className="font-serif text-sm">Open your first room</h3>
					<p className="text-xs text-muted-foreground/70 leading-relaxed">
						Invite AI participants to discuss ideas together
					</p>
				</div>
			</div>
		</div>
	);
}
