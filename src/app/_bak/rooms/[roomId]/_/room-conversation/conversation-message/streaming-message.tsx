import type { ParticipantDTO } from "@briom/core/application/_bak/queries/get-room/query.dto";
import { cn } from "@briom/libs/utils";

import { PARTICIPANT_COLORS } from "../../mappings/participant-colors.map";
import { MessageHeader } from "./message-header";
import { RenderedMessage } from "./rendered-message";

interface StreamingMessageProps {
	content: string;
	participant?: ParticipantDTO;
	participantIndex: number;
}

export function StreamingMessage({
	content,
	participant,
	participantIndex,
}: StreamingMessageProps) {
	const color =
		PARTICIPANT_COLORS[participantIndex % PARTICIPANT_COLORS.length];
	const qualifiedModel = `${participant?.provider}/${participant?.model}`;

	return (
		<div className="group space-y-2">
			<div className={cn("relative py-1 pl-4 border-l-2", color.border)}>
				<MessageHeader
					displayName={participant?.displayName ?? "AI"}
					intent={null}
					isUser={false}
					model={qualifiedModel}
					textColor={color.text}
				/>
				<div className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
					<RenderedMessage content={content} />
					<span className="inline-block w-1.5 h-3.5 bg-primary/60 animate-caret-blink ml-0.5 translate-y-0.5" />
				</div>
			</div>
		</div>
	);
}
