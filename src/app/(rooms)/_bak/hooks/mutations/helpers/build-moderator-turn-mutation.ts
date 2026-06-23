"use client";

import type { GetRoomOutput, GetTurnsOutput } from "@briom/app";
import {
	isServerError,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { queryKeys } from "@briom/rooms/_bak/api/queries/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { buildOptimisticModeratorTurn } from "./build-optimistic-moderator-turn";

type TurnsCache = ServerActionResult<GetTurnsOutput>;
type RoomCache = ServerActionResult<GetRoomOutput>;

interface MutationContext {
	previousRoom?: RoomCache;
	previousTurns?: TurnsCache;
}

interface ModeratorStyleTurnVariables {
	clientTurnId: string;
	content: string;
	moderatorId: string;
	roomId: string;
}

interface BuildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
> {
	errorMessage: string;
	mutationFn: (variables: ModeratorStyleTurnVariables) => Promise<TOutput>;
}

export function buildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
>({ mutationFn, errorMessage }: BuildModeratorTurnMutation<TOutput>) {
	return function useModeratorStyleTurnMutation() {
		const queryClient = useQueryClient();

		const rollback = (roomId: string, context?: MutationContext) => {
			if (context?.previousTurns) {
				queryClient.setQueryData(
					queryKeys.turns.list(roomId),
					context.previousTurns,
				);
			}

			if (context?.previousRoom) {
				queryClient.setQueryData(
					queryKeys.rooms.get(roomId),
					context.previousRoom,
				);
			}
		};

		return useMutation({
			mutationFn,

			onMutate: async (
				variables: ModeratorStyleTurnVariables,
			): Promise<MutationContext> => {
				const turnsKey = queryKeys.turns.list(variables.roomId);
				const roomKey = queryKeys.rooms.get(variables.roomId);

				await queryClient.cancelQueries({ queryKey: turnsKey });
				await queryClient.cancelQueries({ queryKey: roomKey });

				const previousTurns = queryClient.getQueryData<TurnsCache>(turnsKey);
				const previousRoom = queryClient.getQueryData<RoomCache>(roomKey);

				queryClient.setQueryData<TurnsCache>(turnsKey, (old) => {
					if (!old || isServerError(old)) return old;
					return {
						success: true,
						data: {
							turns: [
								...old.data.turns,
								buildOptimisticModeratorTurn({
									clientTurnId: variables.clientTurnId,
									content: variables.content,
									moderatorId: variables.moderatorId,
									roomId: variables.roomId,
									sequence: old.data.turns.length,
								}),
							],
						},
					};
				});

				queryClient.setQueryData<RoomCache>(roomKey, (old) => {
					if (!old || isServerError(old) || !old.data.room) return old;
					return {
						success: true,
						data: {
							room: {
								...old.data.room,
								turnIds: [
									...old.data.room.turnIds,
									`optimistic-${variables.clientTurnId}`,
								],
							},
						},
					};
				});

				return { previousRoom, previousTurns };
			},

			onError: (error: Error, variables, context) => {
				rollback(variables.roomId, context);
				toast.error(errorMessage, { description: error.message });
			},

			onSuccess: (result, variables, context) => {
				if (isServerError(result)) {
					rollback(variables.roomId, context);
					toast.error(errorMessage, { description: result.error.message });
				}
			},
		});
	};
}
