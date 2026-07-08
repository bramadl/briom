import type { GetModeratorOutput } from "@briom/core/app";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { moderatorQueryOptions } from "../queries/query.options";

export function useModerator() {
	const {
		data: { data, metaData },
	} = useSuspenseQuery(moderatorQueryOptions.getProfile());

	const moderator =
		"moderator" in data ? (data as GetModeratorOutput).moderator : null;

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
