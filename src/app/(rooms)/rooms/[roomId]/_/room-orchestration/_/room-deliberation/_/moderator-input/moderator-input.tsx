"use client";

import type { RoomDeliberationDTO } from "@briom/app";
import type { Mentionee } from "@briom/rooms/_/deliberation/editor/helpers/mention-extractor";
import { useModeratorEditor } from "@briom/rooms/_/deliberation/hooks/use-moderator-editor";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { ModeratorButton } from "./_/moderator-button";
import { ModeratorEditor } from "./_/moderator-editor";
import { ModeratorTips } from "./_/moderator-tips";

interface ModeratorInputProps {
	canEdit?: boolean;
	canMention?: boolean;
	isPending?: boolean;
	isStreaming?: boolean;
	onAbort?: () => void;
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	participants?: RoomDeliberationDTO["participants"];
}

export function ModeratorInput({
	canEdit,
	canMention,
	isPending = false,
	isStreaming = false,
	onAbort,
	onSend,
	participants,
}: ModeratorInputProps) {
	const { roomId } = useParams<{ roomId: string }>();
	const draftKey = `room:${roomId}:moderator`;

	const moderatorHint = useMemo(() => {
		return canMention
			? "Introduce the next idea, or @ mention someone to dive deeper..."
			: "Bring a question, an idea, or a dilemma you're working through...";
	}, [canMention]);

	const {
		clearDraftRef,
		editorRef,
		isEmpty,
		isSending,
		mentionList,
		sendHandler,
		setIsEmpty,
	} = useModeratorEditor({
		canEdit,
		draftKey,
		mentionList: canMention
			? participants?.map((p) => ({
					id: p.id,
					label: p.name,
					subtitle: p.model,
				}))
			: undefined,
		onSend,
		placeholder: moderatorHint,
	});

	return (
		<div className="relative max-w-4xl mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5">
			<ModeratorEditor
				clearDraftRef={clearDraftRef}
				draftKey={draftKey}
				editorRef={editorRef}
				mentionList={mentionList}
				onEmptyChange={setIsEmpty}
				onSend={sendHandler}
				placeholder={moderatorHint}
			/>
			<div className="flex items-end justify-between p-4 pt-0">
				<ModeratorTips canMention={canMention} />
				<ModeratorButton
					isDisabled={isEmpty || isStreaming}
					isSending={isSending || isPending}
					isStreaming={isStreaming}
					onAbort={onAbort}
					onSend={sendHandler}
				/>
			</div>
		</div>
	);
}
