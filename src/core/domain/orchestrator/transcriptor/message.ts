import type { ParticipantRole } from "@briom/domain/participant";

export interface Message {
	content: string;
	role: ParticipantRole;
}
