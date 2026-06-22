"use client";

import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";

import {
	EditorSendButton,
	EditorTips,
	type Mentionee,
	ModeratorEditor,
} from "./editor";
import { useModeratorInput } from "./use-moderator-input";

interface ModeratorInputProps {
	canEdit?: boolean;
	canMention?: boolean;
	isStreaming?: boolean;
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	participants?: RoomDTO["participants"];
	placeholder: string;
}

export function ModeratorInput({
	canEdit,
	canMention,
	isStreaming = false,
	onSend,
	participants,
	placeholder,
}: ModeratorInputProps) {
	const {
		editorRef,
		isEmpty,
		isSending,
		mentionList,
		sendHandler,
		setIsEmpty,
	} = useModeratorInput({
		canEdit,
		mentionList: canMention
			? participants?.map((participant) => ({
					id: participant.name,
					label: participant.name,
					subtitle: participant.qualifiedModel,
				}))
			: undefined,
		onSend,
		placeholder,
	});

	return (
		<div
			className={cn(
				"relative max-w-4xl mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
				"focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5",
			)}
		>
			<ModeratorEditor
				editorRef={editorRef}
				mentionList={mentionList}
				onEmptyChange={setIsEmpty}
				onSend={sendHandler}
				placeholder={placeholder}
			/>
			<div className="flex items-end justify-between p-4 pt-0">
				<EditorTips withMention={canMention} />
				<EditorSendButton
					isDisabled={isEmpty || isStreaming}
					isSending={isSending}
					isStreaming={isStreaming}
					onAbort={() => /* TODO: abort stream */ {}}
					onSend={sendHandler}
				/>
			</div>
		</div>
	);
}
