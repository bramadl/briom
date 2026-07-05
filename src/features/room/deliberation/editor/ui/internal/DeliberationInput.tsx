"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import {
	defineExtension,
	type ExtensionConfigBase,
	type LexicalEditor,
	type LexicalExtension,
} from "lexical";
import { useEffect, useMemo, useRef } from "react";

import { ChatEditorExtension } from "../../extensions/chat-editor.extension";
import { createDraftingExtension } from "../../extensions/drafting.extension";
import { SUBMIT_COMMAND } from "../../extensions/send.extension";
import { useEditorEmpty } from "../../hooks/use-editor-empty";
import { type MentionItem, MentionPopup } from "./MentionPopup";

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

function useDeliberationInputExtension(
	draftKey: string | undefined,
	clearDraftRef?: React.RefObject<(() => void) | null>,
) {
	const draftKeyRef = useRef(draftKey);
	draftKeyRef.current = draftKey;

	const clearDraftRefStable = useRef(clearDraftRef);
	clearDraftRefStable.current = clearDraftRef;

	// biome-ignore lint/correctness/useExhaustiveDependencies: stable-ref
	return useMemo(() => {
		const deps: LexicalExtension<
			ExtensionConfigBase,
			"@briom/lexical/ChatEditor" | "@briom/lexical/Drafting",
			unknown,
			unknown
		>[] = [ChatEditorExtension];

		if (draftKey) {
			deps.push(
				createDraftingExtension({
					draftKey,
					onClearRef: clearDraftRef?.current
						? { current: clearDraftRef.current }
						: undefined,
				}),
			);
		}

		return defineExtension({
			name: "@briom/lexical/DeliberationInput",
			dependencies: deps,
		});
	}, []);
}

interface DeliberationInputProps {
	clearDraftRef?: React.RefObject<(() => void) | null>;
	draftKey?: string;
	editorRef?: React.RefObject<LexicalEditor | null>;
	mentionList?: MentionItem[];
	onEmptyChange?: (isEmpty: boolean) => void;
	onSend?: () => void;
	placeholder?: string;
}

export function DeliberationInput({
	clearDraftRef,
	draftKey,
	editorRef,
	mentionList,
	onEmptyChange,
	onSend,
	placeholder = "Enter something",
}: DeliberationInputProps) {
	const extension = useDeliberationInputExtension(draftKey, clearDraftRef);
	return (
		<LexicalExtensionComposer contentEditable={null} extension={extension}>
			<ContentEditable
				aria-placeholder={placeholder}
				className="size-full bg-transparent focus:outline-none"
				placeholder={
					<div className="pointer-events-none absolute inset-0 px-4 mt-1 text-base md:text-sm text-muted-foreground/30 select-none leading-relaxed">
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
