import type { ParticipantDTO } from "@briom/core/application";

export type SendHandler = (
	content: string,
	mentionedParticipantId?: string,
) => Promise<boolean>;

export interface ConversationInputProps {
	disabled?: boolean;
	isStreaming?: boolean;
	onAbort?: () => void;
	onSend: SendHandler;
	participants: ParticipantDTO[];
	placeholder?: string;
}
