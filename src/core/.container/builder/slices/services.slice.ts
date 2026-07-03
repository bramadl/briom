import { StreamConsumer, TranscriptorRenderer } from "@briom/core/app";

import { adaptersSlice } from "./adapters.slice";

/**
 * @description
 * Layer 2 — internal application services. These are NOT ports (no
 * interface to swap), just plain classes that extract shared mechanics
 * out of command handlers.
 */
export const servicesSlice = adaptersSlice
	.add("service:streamConsumer", (r) => {
		const turnRepository = r["repository:turn"];
		const turnAbortSignal = r["signal:turn-abort:drizzle"];

		return new StreamConsumer(turnRepository, turnAbortSignal);
	})

	.add("service:transcriptorRenderer", () => new TranscriptorRenderer());
