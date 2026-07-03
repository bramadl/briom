import { formatDate } from "date-fns";

interface RoomCreationDateProps {
	formedAt: string;
}

export function RoomCreationDate({ formedAt }: RoomCreationDateProps) {
	return (
		<p className="text-xs text-muted-foreground">
			Room formed at {formatDate(new Date(formedAt), "dd MMMM yyyy")}
		</p>
	);
}
