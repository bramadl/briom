"use client";

import { useHotkey } from "@tanstack/react-hotkeys";
import { $createParagraphNode, $getRoot, type LexicalEditor } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	editorStateToMarkdown,
	extractMentionees,
	type Mentionee,
	type MentionItem,
} from "./editor";

interface UseModeratorInputOptions {
	canEdit?: boolean;
	mentionList?: MentionItem[];
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	placeholder: string;
}

export function useModeratorInput({
	canEdit,
	mentionList,
	onSend,
	placeholder,
}: UseModeratorInputOptions) {
	const editorRef = useRef<LexicalEditor | null>(null);
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
	}, []);

	const focus = useCallback(() => {
		editorRef.current?.focus();
	}, []);

	const sendHandler = useCallback(async () => {
		const editor = editorRef.current;
		if (!editor || isEmpty || isSending) return;

		const content = editorStateToMarkdown(editor);
		if (!content.trim()) return;

		const mentionees = extractMentionees(editor);
		setIsSending(true);

		try {
			await onSend?.(content, mentionees);
			clear();
		} catch (error) {
			console.error("Failed to send moderator turn", error);
		} finally {
			setIsSending(false);
		}
	}, [clear, isEmpty, isSending, onSend]);

	useEffect(() => {
		editorRef.current?.setEditable(canEdit ?? true);
	}, [canEdit]);

	useHotkey(
		"Mod+K",
		() => {
			const editor = editorRef.current;
			if (!editor) return;
			const isFocused = editor.getRootElement() === document.activeElement;
			if (!isFocused) focus();
		},
		{ conflictBehavior: "replace" },
	);

	return {
		clear,
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
