"use client";

import { cn } from "@briom/libs/utils";
import { ChatEditorExtension } from "@briom/rooms/_/deliberation/editor/extensions/chat-editor.extension";
import { createDraftingExtension } from "@briom/rooms/_/deliberation/editor/extensions/drafting.extension";
import { SUBMIT_COMMAND } from "@briom/rooms/_/deliberation/editor/extensions/send.extension";
import { MentionPopup } from "@briom/rooms/_/deliberation/editor/ui/mention-popup";
import { useEditorEmpty } from "@briom/rooms/_/deliberation/hooks/use-editor-empty";
import type { MentionItem } from "@briom/rooms/_/deliberation/hooks/use-moderator-editor";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { defineExtension, type LexicalEditor } from "lexical";
import { useEffect, useMemo } from "react";

function EmptyStateBridge({
	onEmptyChange,
}: {
	onEmptyChange?: (isEmpty: boolean) => void;
}) {
	const isEmpty = useEditorEmpty();
	useEffect(() => {
		onEmptyChange?.(isEmpty);
	}, [isEmpty, onEmptyChange]);

	return null;
}

function SubmitBridge({ onSend }: { onSend?: () => void }) {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		if (!onSend) return;
		return editor.registerCommand(
			SUBMIT_COMMAND,
			() => {
				onSend();
				return true;
			},
			0,
		);
	}, [editor, onSend]);

	return null;
}

interface ModeratorEditorProps {
	clearDraftRef?: React.RefObject<(() => void) | null>;
	draftKey?: string;
	editorRef?: React.RefObject<LexicalEditor | null>;
	mentionList?: MentionItem[];
	onEmptyChange?: (isEmpty: boolean) => void;
	onSend?: () => void;
	placeholder?: string;
}

export function ModeratorEditor({
	clearDraftRef,
	draftKey,
	editorRef,
	mentionList,
	onEmptyChange,
	onSend,
	placeholder = "Enter something",
}: ModeratorEditorProps) {
	const extension = useMemo(() => {
		if (!draftKey) return ChatEditorExtension;

		return defineExtension({
			name: "@briom/lexical/ModeratorEditor",
			dependencies: [
				ChatEditorExtension,
				createDraftingExtension({ draftKey, onClearRef: clearDraftRef }),
			],
		});
	}, [draftKey, clearDraftRef]);

	return (
		<LexicalExtensionComposer
			contentEditable={null}
			extension={extension}
			key={draftKey}
		>
			<ContentEditable
				aria-placeholder={placeholder}
				className={cn(
					"min-h-20 lg:min-h-16 max-h-[36rem] w-full bg-transparent",
					"px-4 pt-3 pb-1 text-sm leading-relaxed",
					"overflow-y-auto focus:outline-none",
				)}
				placeholder={
					<div className="pointer-events-none absolute inset-0 px-4 pt-4 text-sm text-muted-foreground/30 select-none leading-relaxed">
						{placeholder}
					</div>
				}
			/>
			{editorRef ? <EditorRefPlugin editorRef={editorRef} /> : null}
			<EmptyStateBridge onEmptyChange={onEmptyChange} />
			<SubmitBridge onSend={onSend} />
			{mentionList ? <MentionPopup entities={mentionList} /> : null}
		</LexicalExtensionComposer>
	);
}
