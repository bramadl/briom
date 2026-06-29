"use client";

import type { RoomDeliberationDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { AttachmentButton } from "@briom/rooms/_/deliberation/attachments/attachment-button";
import { AttachmentPreview } from "@briom/rooms/_/deliberation/attachments/attachment-preview";
import {
	type PendingAttachment,
	useAttachment,
} from "@briom/rooms/_/deliberation/attachments/use-attachment";
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
	onSend?: (
		content: string,
		mentionees: Mentionee[],
		attachments: PendingAttachment[],
	) => void | Promise<void>;
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
		attachments,
		canAddMore,
		clear: clearAttachments,
		getInputProps,
		getRootProps,
		isDragActive,
		isUploading,
		openPicker,
		removeAttachment,
		uploadError,
	} = useAttachment(roomId);

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
		onSend: async (content, mentionees) => {
			await onSend?.(content, mentionees, attachments);
			clearAttachments();
		},
		placeholder: moderatorHint,
	});

	const isDisabled =
		(isEmpty && attachments.length === 0) || isStreaming || isUploading;

	return (
		<div
			className={cn(
				"relative flex flex-col gap-4 py-4 max-w-4xl mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
				"focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5",
				isDragActive &&
					"border-primary/60 bg-primary/5 shadow-lg shadow-primary/10",
			)}
			{...getRootProps()}
		>
			<input {...getInputProps()} />

			{attachments.length > 0 && (
				<div className="absolute z-1 bottom-full left-1/2 -translate-x-1/2 w-[95%] p-2 bg-card border border-b-0 border-border/50 backdrop-blur rounded-t-xl">
					<AttachmentPreview
						attachments={attachments}
						onRemove={removeAttachment}
					/>
				</div>
			)}

			{isDragActive && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none backdrop-blur-md">
					<p className="text-sm font-medium text-primary/80">
						Drop file to attach
					</p>
				</div>
			)}

			<div className="relative text-base md:text-sm leading-relaxed min-h-16 lg:min-h-8 max-h-96 px-4 overflow-y-auto">
				<ModeratorEditor
					clearDraftRef={clearDraftRef}
					draftKey={draftKey}
					editorRef={editorRef}
					mentionList={mentionList}
					onEmptyChange={setIsEmpty}
					onSend={sendHandler}
					placeholder={moderatorHint}
				/>
			</div>

			<div className="flex items-center justify-between gap-4 px-4">
				<div className="flex-1 flex flex-wrap items-center gap-4">
					<AttachmentButton
						canAddMore={canAddMore}
						isUploading={isUploading}
						onAdd={openPicker}
						uploadError={uploadError}
					/>
					<ModeratorTips canMention={canMention} />
				</div>
				<ModeratorButton
					isDisabled={isDisabled}
					isSending={isSending || isPending}
					isStreaming={isStreaming}
					onAbort={onAbort}
					onSend={sendHandler}
				/>
			</div>
		</div>
	);
}
