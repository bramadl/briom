"use client";

import type {
	ParticipantDTO,
	TurnDTO,
} from "@briom/app/queries/get-room/query.dto";
import { cn } from "@briom/libs/utils";
import dynamic from "next/dynamic";

import { INTENT_LABEL } from "../../mappings/intent-label.map";
import { PARTICIPANT_COLORS } from "../../mappings/participant-colors.map";
import { USER_COLOR } from "../../mappings/user-color.map";
import { MessageActions } from "./message-actions";
import { MessageHeader } from "./message-header";

const MessageContent = dynamic(
	() =>
		import("./message-content").then((m) => ({
			default: m.MessageContent,
		})),
	{ ssr: false },
);

interface ConversationMessageProps {
	isLatestTurn?: boolean;
	onMounted(): void;
	participant?: ParticipantDTO;
	participantIndex: number;
	turn: TurnDTO;
}

export function ConversationMessage({
	isLatestTurn,
	onMounted,
	participant,
	participantIndex,
	turn,
}: ConversationMessageProps) {
	const isUser = turn.role === "user";

	const qualifiedModel = `${participant?.provider}/${participant?.model}`;
	const intent = isUser ? null : turn.intent ? INTENT_LABEL[turn.intent] : null;

	const color = isUser
		? USER_COLOR
		: PARTICIPANT_COLORS[participantIndex % PARTICIPANT_COLORS.length];

	const displayName = isUser ? "You" : (participant?.displayName ?? "AI");
	const time = new Date(turn.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className={cn("group space-y-2", isUser && "max-w-xl ml-auto")}>
			<div
				className={cn(
					"relative py-1",
					isUser
						? cn("bg-muted/50 p-4 rounded-lg")
						: cn("pl-4 border-l-2", color.border),
				)}
			>
				{!isUser && (
					<MessageHeader
						displayName={displayName}
						intent={intent}
						model={qualifiedModel}
						textColor={color.text}
					/>
				)}

				<MessageContent
					content={turn.content}
					isLatestTurn={isLatestTurn}
					onMounted={onMounted}
				/>
			</div>
			<MessageActions content={turn.content} isUser={isUser} time={time} />
		</div>
	);
}
