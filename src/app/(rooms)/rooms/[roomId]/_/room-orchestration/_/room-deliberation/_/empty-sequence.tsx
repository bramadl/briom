import type { RoomDeliberationParticipantDTO } from "@briom/app";

interface EmptySequenceProps {
	participants?: RoomDeliberationParticipantDTO[];
}

export function EmptySequence({ participants }: EmptySequenceProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-8 lg:gap-16 px-6 text-center">
			<div className="flex flex-col gap-2">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Fresh Room
				</p>
				<h2 className="font-serif text-2xl sm:text-3xl">This room is ready</h2>
				<p className="max-w-md text-sm text-muted-foreground leading-relaxed">
					Send your first topic into the room and start the deliberation –
					everyone below will read it from the start. Once the deliberation
					started, no more participants can be added.
				</p>
			</div>
			{participants && participants.length > 0 && (
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
