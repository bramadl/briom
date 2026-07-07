import { useHotkey } from "@tanstack/react-hotkeys";
import type { LexicalEditor, SerializedEditorState } from "lexical";
import { $createParagraphNode, $getRoot } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import { editorStateToMarkdown } from "../helpers/markdown-conversion";
import {
	extractMentionees,
	type Mentionee,
} from "../helpers/mention-extractor";
import { ROOM_EDITOR_SHORTCUT } from "../shortcut";

export interface MentionItem {
	id: string;
	label: string;
	subtitle: string;
}

interface UseDeliberationEditorOptions {
	canEdit?: boolean;
	canSend?: boolean;
	draftKey?: string;
	mentionList?: MentionItem[];
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	placeholder: string;
}

export function useDeliberationEditor({
	canEdit,
	canSend,
	mentionList,
	onSend,
	placeholder,
}: UseDeliberationEditorOptions) {
	const clearDraftRef = useRef<(() => void) | null>(null);
	const editorRef = useRef<LexicalEditor | null>(null);
	const isSendingRef = useRef(false);

	const [isEmpty, setIsEmpty] = useState(true);
	const [isSending, setIsSending] = useState(false);

	const clear = useCallback(() => {
		const editor = editorRef.current;
		if (!editor) return;

		editor.update(() => {
			const root = $getRoot();
			root.clear();
			root.append($createParagraphNode());
		});

		clearDraftRef.current?.();
	}, []);

	const focus = useCallback(() => {
		editorRef.current?.focus();
	}, []);

	const sendHandler = useCallback(async () => {
		if (!canSend) return;

		const editor = editorRef.current;
		if (!editor || isEmpty || isSendingRef.current) return;

		const content = editorStateToMarkdown(editor);
		if (!content.trim()) return;

		const mentionees = extractMentionees(editor);
		const snapshot: SerializedEditorState = editor.getEditorState().toJSON();

		isSendingRef.current = true;
		setIsSending(true);
		clear();

		try {
			await onSend?.(content, mentionees);
		} catch {
			const restoreEditor = editorRef.current;
			if (restoreEditor) {
				const restoredState = restoreEditor.parseEditorState(snapshot);
				restoreEditor.setEditorState(restoredState);
			}
		} finally {
			isSendingRef.current = false;
			setIsSending(false);
		}
	}, [canSend, clear, isEmpty, onSend]);

	useEffect(() => {
		editorRef.current?.setEditable(canEdit ?? true);
	}, [canEdit]);

	useHotkey(ROOM_EDITOR_SHORTCUT.key, focus);

	return {
		clear,
		clearDraftRef,
		editorRef,
		focus,
		isEmpty,
		isSending,
		mentionList,
		placeholder,
		sendHandler,
		setIsEmpty,
	};
}
