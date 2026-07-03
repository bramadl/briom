interface RoomIdHashProps {
	id: string;
}

export function RoomIdHash({ id }: RoomIdHashProps) {
	return (
		<p className="text-xs text-muted-foreground/50 font-mono">
			#{id.slice(0, 8)}
		</p>
	);
}
