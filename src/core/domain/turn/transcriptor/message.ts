import type { Role } from "./role";

/**
 * @description
 * A single message in the LLM conversation history.
 *
 * **Not a domain concept** — this is a provider-agnostic DTO used by the
 * `TranscriptorRenderer` to format deliberation context for LLM consumption.
 * The domain uses `Turn`, not `Message`.
 */
export interface Message {
	content: string;
	role: Role;
}
