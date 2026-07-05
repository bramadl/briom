import type { RoomParticipantDTO } from "@briom/core/app";
import { cn } from "@briom/libs/utils";
import { useModerator } from "@briom/moderator/hooks/use-moderator";
import { useRoom } from "@briom/room/hooks/use-room";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useAttachment } from "../../attachments/hooks/use-attachment";
import { AttachmentButton } from "../../attachments/ui/AttachmentButton";
import { AttachmentPreview } from "../../attachments/ui/AttachmentPreview";
import type { PendingAttachment } from "../../attachments/utils/attachment.types";
import type { Mentionee } from "../helpers/mention-extractor";
import { useDeliberationEditor } from "../hooks/use-deliberation-editor";
import { DeliberationEditorButton } from "./internal/DeliberationEditorButton";
import { DeliberationEditorTips } from "./internal/DeliberationEditorTips";
import { DeliberationInput } from "./internal/DeliberationInput";

interface DeliberationEditorProps {
	/**
	 * @description
	 * Whether the moderator is allowed to type at all. Derived upstream
	 * from room-level locks only (`isConcluded`, `isFrozen`, `isLocked`,
	 * `isTurnSlotClaimed`) — deliberately does NOT fold in `isPending`.
	 * A moderator turn being in flight is not a reason to stop the
	 * moderator from composing their next message; only room-level state
	 * changes (e.g. the slot getting claimed by the resulting participant
	 * turn) should ever make the editor read-only.
	 */
	canEdit: boolean;

	/**
	 * @description
	 * Wether the editor should provide mention feature (showing `mention`
	 * tips as well).
	 */
	canMention: boolean;

	/**
	 * @description
	 * True while `initiateTurn` is in flight. Used here ONLY to:
	 * - lock the attachment add/remove controls (the in-flight payload
	 *   already captured whatever attachments existed at submit time —
	 *   letting the user mutate the list mid-flight would desync what's
	 *   shown from what was actually sent)
	 * - disable the Send button (prevent duplicate submissions)
	 *
	 * It does NOT drive `canEdit` — see that prop's doc comment.
	 */
	isPending: boolean;

	/**
	 * @description
	 * True while the claimed participant turn is actively streaming.
	 * Currently always `false` from the caller — wiring this to the real
	 * streaming phase, and giving `onAbort` a real implementation, is
	 * out of scope for this pass and tracked separately.
	 */
	isStreaming: boolean;

	/**
	 * @description
	 * Fires when the Button is in abort state and is clicked.
	 */
	onAbort: () => void;

	/**
	 * @description
	 * Fires when the Editor invokes it send handler.
	 */
	onSend: (
		content: string,
		mentionees: Mentionee[],
		attachments: PendingAttachment[],
	) => void | Promise<void>;

	/**
	 * @description
	 * Invited AI participants into the room.
	 */
	participants: RoomParticipantDTO[];
}

export function DeliberationEditor({
	canEdit,
	canMention,
	isPending = false,
	isStreaming = false,
	onAbort,
	onSend,
	participants,
}: DeliberationEditorProps) {
	const { roomId } = useParams<{ roomId: string }>();
	const draftKey = `room:${roomId}:moderator`;

	const moderatorHint = useMemo(() => {
		return canMention
			? "Introduce the next idea, or @ mention someone to dive deeper..."
			: "Bring a question, an idea, or a dilemma you're working through...";
	}, [canMention]);

	const { canAttachFile } = useRoom();
	const {
		limit: { maximumAttachmentPerRoom },
	} = useModerator();

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
	} = useAttachment({
		roomId,
		canAttachFile,
		maxAttachments: maximumAttachmentPerRoom,
	});

	const {
		clearDraftRef,
		editorRef,
		isEmpty,
		isSending,
		mentionList,
		sendHandler,
		setIsEmpty,
	} = useDeliberationEditor({
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

	const canTouchAttachments = !isPending;
	const canSend =
		canEdit &&
		!isPending &&
		!isStreaming &&
		!isUploading &&
		(!isEmpty || attachments.length > 0);

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
						canRemove={canTouchAttachments}
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
				<DeliberationInput
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
						canAdd={canAddMore && canTouchAttachments}
						isUploading={isUploading}
						onAttach={openPicker}
						uploadError={uploadError}
					/>
					<DeliberationEditorTips canMention={canMention} />
				</div>

				<DeliberationEditorButton
					isDisabled={!canSend}
					isSending={isSending || isPending}
					isStreaming={isStreaming}
					onAbort={onAbort}
					onSend={sendHandler}
				/>
			</div>
		</div>
	);
}
