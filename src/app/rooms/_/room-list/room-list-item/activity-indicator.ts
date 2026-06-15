import { differenceInMinutes, parseISO } from "date-fns";

export const activityIndicatorColorMap = {
	ACTIVE: "bg-green-950",
	STALE: "bg-yellow-950",
	DEAD: "bg-olive-600",
};

type ActivityStatus = keyof typeof activityIndicatorColorMap;

export function getActivityStatus(dateString: string): ActivityStatus {
	const date = parseISO(dateString);
	const now = new Date();
	const diffInMinutes = differenceInMinutes(now, date);

	if (diffInMinutes <= 10) return "ACTIVE";
	if (diffInMinutes <= 1440) return "STALE";
	return "DEAD";
}
