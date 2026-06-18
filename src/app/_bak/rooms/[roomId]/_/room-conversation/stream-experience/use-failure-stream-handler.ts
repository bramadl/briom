"use client";

import type { TurnDTO } from "@briom/core/application/_bak/queries/get-room/query.dto";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
	buildFailureState,
	type FailureState,
	findLastFailedTurn,
} from "./helpers";

export function useFailureStreamHandler(
	turns: TurnDTO[],
): FailureState & { dismiss: () => void; clear: () => void } {
	const derivedFailedInfo = useMemo(() => findLastFailedTurn(turns), [turns]);

	const [failureState, setFailureState] = useState<FailureState>(() => {
		if (!derivedFailedInfo) return { retryInfo: null, streamError: null };
		return buildFailureState(derivedFailedInfo);
	});

	useEffect(() => {
		if (!derivedFailedInfo) return;
		setFailureState((prev) => {
			if (prev.retryInfo) return prev;
			return buildFailureState(derivedFailedInfo);
		});
	}, [derivedFailedInfo]);

	const dismiss = useCallback(() => {
		setFailureState({ retryInfo: null, streamError: null });
	}, []);

	const clear = useCallback(() => {
		setFailureState({ retryInfo: null, streamError: null });
	}, []);

	return { ...failureState, dismiss, clear };
}
