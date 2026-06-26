import { useCallback } from "react";

import { useAbortTurnMutation } from "../../turn/mutations/use-abort-turn.mutation";

export function useAbortStreaming(streamingTurnId: string | null) {
	const { mutate: abortTurn } = useAbortTurnMutation();

	const abortStreaming = useCallback(() => {
		if (!streamingTurnId) return;
		abortTurn({ turnId: streamingTurnId });
	}, [abortTurn, streamingTurnId]);

	return abortStreaming;
}
