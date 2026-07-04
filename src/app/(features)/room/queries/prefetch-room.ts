"use server";

import type { QueryClient } from "@tanstack/react-query";

import { roomQueryOptions } from "./internal/query.options";

export async function prefetchRoom(queryClient: QueryClient, roomId: string) {
	await queryClient.prefetchQuery(roomQueryOptions.getRoom(roomId));
}
