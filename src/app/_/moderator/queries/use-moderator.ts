import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { moderatorQueryOptions } from "./internal/query.options";

export function useModerator() {
	const { data } = useSuspenseQuery(moderatorQueryOptions.getProfile());

	const {
		data: { moderator },
		metaData,
	} = data;

	if (!moderator) return notFound();

	const initials = moderator.name
		.split(" ")
		.map((w) => w.toUpperCase())
		.slice(0, 2);

	return {
		...moderator,
		...metaData,
		avatar: moderator.avatar ?? undefined,
		initials,
	};
}
