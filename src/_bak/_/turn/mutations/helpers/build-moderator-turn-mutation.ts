import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
} from "@briom/app/bak";
import type { ServerActionResult } from "@briom/libs/server-action";
import { roomQueries } from "@briom/rooms/_/room/queries/registry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { buildOptimisticModeratorTurn } from "./build-optimistic-moderator-turn";

type ModeratorTurnInput =
	| Omit<InitiateTopicTurnInput, "moderatorId">
	| Omit<InitiateModeratorTurnInput, "moderatorId">;

interface BuildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
> {
	errorMessage: string;
	mutationFn: (variables: ModeratorTurnInput) => Promise<TOutput>;
}

export function buildModeratorTurnMutation<
	TOutput extends ServerActionResult<unknown>,
>({ mutationFn, errorMessage }: BuildModeratorTurnMutation<TOutput>) {
	return function useModeratorStyleTurnMutation() {
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn,

			onMutate: async ({ roomId, clientTurnId, content, attachments }) => {
				const deliberationKey = roomQueries.getRoomDeliberation({
					roomId,
				}).queryKey;

				const previousDeliberation = queryClient.getQueryData(deliberationKey);
				if (previousDeliberation) {
					queryClient.setQueryData(deliberationKey, (old) => {
						if (!old?.room) return old;
						const alreadyExists = old.room.turns.some(
							(t) => t.id === `optimistic-${clientTurnId}`,
						);

						if (alreadyExists) return old;
						return {
							room: {
								...old.room,
								turns: [
									...old.room.turns,
									buildOptimisticModeratorTurn({
										clientTurnId,
										content,
										attachments,
									}),
								],
							},
						};
					});
				}

				return { previousDeliberation, deliberationKey, roomId };
			},

			onError: (error, _, context) => {
				if (context) {
					queryClient.setQueryData(
						context.deliberationKey,
						context.previousDeliberation,
					);
				}
				toast.error(errorMessage, { description: error.message });
			},
		});
	};
}
