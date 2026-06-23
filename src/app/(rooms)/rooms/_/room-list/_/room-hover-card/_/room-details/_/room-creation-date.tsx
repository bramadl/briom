import { formatDate } from "date-fns";

interface RoomCreationDateProps {
	createdAt: string;
}

export function RoomCreationDate({ createdAt }: RoomCreationDateProps) {
	return (
		<p className="text-xs text-muted-foreground">
			Room formed at {formatDate(new Date(createdAt), "dd MMMM yyyy")}
		</p>
	);
}
