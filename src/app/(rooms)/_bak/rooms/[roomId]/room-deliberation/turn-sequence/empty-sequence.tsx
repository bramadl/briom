"use client";

import { useRoom } from "../../../../hooks/store/use-room";

export function EmptySequence() {
	const {
		room: { participants },
	} = useRoom();

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="flex flex-col gap-2">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Fresh Room
				</p>
				<h2 className="font-serif text-2xl sm:text-3xl">This room is ready</h2>
				<p className="max-w-md text-sm text-muted-foreground leading-relaxed">
					Bring your first topic into the room – everyone below will read it
					from the start. Once you send your first topic, the deliberation will
					start. At this point, no more participants can be added. Ensure you
					have all participants invited.
				</p>
			</div>
			{participants.length > 0 && (
				<div className="flex flex-col items-center gap-2">
					<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
						In this room
					</span>
					<div className="flex flex-wrap items-center justify-center gap-2">
						{participants.map((participant) => (
							<span
								className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs font-serif"
								key={participant.id}
							>
								{participant.name}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
