import { useHotkey } from "@tanstack/react-hotkeys";
import type { LexicalEditor } from "lexical";
import { $createParagraphNode, $getRoot } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import { ROOM_SETTING } from "../../room/config/setting";
import { editorStateToMarkdown } from "../editor/helpers/markdown-conversion";
import {
	extractMentionees,
	type Mentionee,
} from "../editor/helpers/mention-extractor";

export interface MentionItem {
	id: string;
	label: string;
	subtitle: string;
}

interface UseModeratorEditorOptions {
	canEdit?: boolean;
	draftKey?: string;
	mentionList?: MentionItem[];
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	placeholder: string;
}

export function useModeratorEditor({
	canEdit,
	mentionList,
	onSend,
	placeholder,
}: UseModeratorEditorOptions) {
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
		const editor = editorRef.current;
		if (!editor || isEmpty || isSendingRef.current) return;

		const content = editorStateToMarkdown(editor);
		if (!content.trim()) return;

		const mentionees = extractMentionees(editor);
		isSendingRef.current = true;
		setIsSending(true);

		try {
			await onSend?.(content, mentionees);
			clear();
		} catch (error) {
			console.error("Failed to send moderator turn", error);
		} finally {
			isSendingRef.current = false;
			setIsSending(false);
		}
	}, [clear, isEmpty, onSend]);

	useEffect(() => {
		editorRef.current?.setEditable(canEdit ?? true);
	}, [canEdit]);

	useHotkey(ROOM_SETTING.SHORTCUTS.input.key, focus);

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
