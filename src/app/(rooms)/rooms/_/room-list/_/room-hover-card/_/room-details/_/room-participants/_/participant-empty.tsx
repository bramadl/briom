export function ParticipantEmpty() {
	return (
		<div className="py-2 text-center">
			<p className="text-sm text-muted-foreground italic">
				No participants invited yet.
			</p>
			<p className="text-[10px] font-mono text-muted-foreground/50 mt-1">
				Open this room to invite participants.
			</p>
		</div>
	);
}
