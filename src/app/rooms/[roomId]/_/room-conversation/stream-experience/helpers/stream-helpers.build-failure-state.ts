import type { ApiError } from "@briom/api/contracts/types";

import type { RetryInfo } from "./stream-helpers.find-last-failed-turn";

const STREAM_FAILURE_MESSAGE =
	"Stream was interrupted. Click retry to continue";

export interface FailureState {
	retryInfo: RetryInfo | null;
	streamError: ApiError | null;
}

export function buildFailureState(retryInfo: RetryInfo): FailureState {
	return {
		retryInfo,
		streamError: {
			kind: "STREAM_FAILURE",
			message: STREAM_FAILURE_MESSAGE,
		},
	};
}
