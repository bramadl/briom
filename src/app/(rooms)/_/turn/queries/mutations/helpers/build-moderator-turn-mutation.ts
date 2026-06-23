"use client";

import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
} from "@briom/app";
import type { ServerActionResult } from "@briom/libs/server-action";
import { roomQueryKeys } from "@briom/rooms/_/room/queries/keys";
import { roomQueries } from "@briom/rooms/_/room/queries/registry";
import { turnQueryKeys } from "@briom/rooms/_/turn/queries/keys";
import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { buildOptimisticModeratorTurn } from "./build-optimistic-moderator-turn";

interface BuildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
> {
	errorMessage: string;
	mutationFn: (
		variables: InitiateTopicTurnInput | InitiateModeratorTurnInput,
	) => Promise<TOutput>;
}

export function buildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
>({ mutationFn, errorMessage }: BuildModeratorTurnMutation<TOutput>) {
	return function useModeratorStyleTurnMutation() {
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn,

			onMutate: async ({ roomId, clientTurnId, content, moderatorId }) => {
				const turnsKey = turnQueries.getTurns({ roomId }).queryKey;
				const roomKey = roomQueries.getRoom({ roomId }).queryKey;

				await queryClient.cancelQueries({ queryKey: turnQueryKeys.all });
				await queryClient.cancelQueries({ queryKey: roomQueryKeys.all });

				const previousTurns = queryClient.getQueryData(turnsKey);
				const previousRoom = queryClient.getQueryData(roomKey);

				if (previousTurns) {
					queryClient.setQueryData(turnsKey, (old) => {
						if (!old?.turns) return old;
						return {
							...old,
							turns: [
								...old.turns,
								buildOptimisticModeratorTurn({
									clientTurnId,
									content,
									moderatorId,
									roomId,
									sequence: old.turns.length,
								}),
							],
						};
					});
				}

				if (previousRoom) {
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.room) return old;
						return {
							...old,
							room: {
								...old.room,
								turnIds: [...old.room.turnIds, `optimistic-${clientTurnId}`],
							},
						};
					});
				}

				return { previousTurns, previousRoom, turnsKey, roomKey, roomId };
			},

			onError: (error, _, context) => {
				if (context) {
					queryClient.setQueryData(context.turnsKey, context.previousTurns);
					queryClient.setQueryData(context.roomKey, context.previousRoom);
				}
				toast.error(errorMessage, { description: error.message });
			},
		});
	};
}
