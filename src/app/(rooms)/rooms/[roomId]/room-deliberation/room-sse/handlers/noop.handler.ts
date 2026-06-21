import type { SseEventHandler } from "../sse-types";

export const noopHandler: SseEventHandler = {
	handle: () => {},
};
