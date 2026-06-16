import type { ParticipantDTO } from "@briom/core/application";
import type { EditorThemeClasses } from "lexical";

export type SendHandler = (
	content: string,
	mentionedParticipantId?: string,
) => Promise<boolean>;

export interface ConversationInputProps {
	disabled?: boolean;
	editorTheme?: EditorThemeClasses;
	isStreaming?: boolean;
	namespace?: string;
	onAbort?: () => void;
	onSend: SendHandler;
	participants: ParticipantDTO[];
	placeholder?: string;
}

export interface MentionableParticipant {
	displayName: string;
	id: string;
	model: string;
	provider: string;
}
