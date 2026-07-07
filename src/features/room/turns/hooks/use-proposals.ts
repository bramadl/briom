import type { TurnProposalDTO } from "@briom/core/app";
import {
	turnStreamActions,
	useShouldShowProposals,
} from "@briom/room/turns/store/turn-stream.store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";

import { turnQueryOptions } from "../queries/query.options";
import { useAcceptProposalMutation } from "./use-accept-proposal-mutation";

export function useProposals(roomId: string) {
	const {
		data: {
			data: { proposals },
		},
	} = useSuspenseQuery(turnQueryOptions.getProposals(roomId));

	const [pending, startTransition] = useTransition();

	const shouldShowProposals = useShouldShowProposals();
	const showProposals = !pending && shouldShowProposals && proposals.length > 0;

	const mutation = useAcceptProposalMutation(roomId);

	const acceptProposal = useCallback(
		async ({ intent, participantId }: TurnProposalDTO) => {
			startTransition(async () => {
				turnStreamActions.setProposalsVisible(false);
				try {
					const pending = mutation.mutateAsync({
						intent,
						participantId,
						roomId,
					});

					await pending;
				} catch (error) {
					toast.error("Failed to send", {
						description: (error as Error).message,
					});
					throw error;
				}
			});
		},
		[roomId, mutation.mutateAsync],
	);

	return { acceptProposal, proposals, showProposals };
}
