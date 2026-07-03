interface ParticipantCountProps {
	count: number;
}

export function ParticipantCount({ count }: ParticipantCountProps) {
	return (
		<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">
			{count} participant{count > 1 ? "s" : ""} in this deliberation
		</span>
	);
}
