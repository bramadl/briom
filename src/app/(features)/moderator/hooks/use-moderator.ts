import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { moderatorQueryOptions } from "../queries/internal/query.options";

export function useModerator() {
	const { data } = useSuspenseQuery(moderatorQueryOptions.getProfile());

	const {
		data: { moderator },
		metaData,
	} = data;

	if (!moderator) return notFound();

	const initials = moderator.name
		.split(" ")
		.map((w) => w.at(0)?.toUpperCase())
		.slice(0, 2);

	return {
		...moderator,
		...metaData,
		avatar: moderator.avatar ?? undefined,
		initials,
	};
}
