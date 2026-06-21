"use client";

import { cn } from "@briom/libs/utils";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useEditor, useEditorState } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	buildDefaultExtensions,
	buildMentionExtensions,
	editorToMarkdown,
	extractMentionees,
	type Mentionee,
	type MentionItem,
	SendShortcutExtension,
} from "./editor";

interface UseModeratorInputOptions {
	canEdit?: boolean;
	mentionList?: MentionItem[];
	onSend?: (content: string, mentionees: Mentionee[]) => void | Promise<void>;
	placeholder: string;
}

export function useModeratorInput({
	onSend,
	placeholder,
	mentionList,
}: UseModeratorInputOptions) {
	const [isSending, setIsSending] = useState(false);

	const editor = useEditor(
		{
			extensions: [
				...buildDefaultExtensions(placeholder),
				...(mentionList ? [buildMentionExtensions(mentionList)] : []),
				SendShortcutExtension,
			],
			editorProps: {
				attributes: {
					class: cn(
						"min-h-24 lg:min-h-16 max-h-[36rem] w-full bg-transparent px-4 pt-3 text-sm",
						"overflow-y-auto focus:outline-none font-sans leading-relaxed",
						"prose prose-sm dark:prose-invert max-w-none",
						"prose-p:my-0 prose-p:leading-relaxed",
						"[&>p.is-editor-empty:only-child]:before:content-[attr(data-placeholder)]",
						"[&>p.is-editor-empty:only-child]:before:float-left",
						"[&>p.is-editor-empty:only-child]:before:text-muted-foreground/30",
						"[&>p.is-editor-empty:only-child]:before:pointer-events-none",
						"[&>p.is-editor-empty:only-child]:before:h-0",
					),
				},
			},
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
		},
		[placeholder, mentionList],
	);

	const isEmpty = useEditorState({
		editor,
		selector: ({ editor }) => !editor || editor.isEmpty,
	});

	const clear = useCallback(() => {
		if (!editor || editor.isDestroyed) return;
		editor.commands.clearContent();
		editor.commands.setContent("<p></p>");
	}, [editor]);

	const focus = useCallback(() => {
		if (!editor || editor.isDestroyed) return;
		editor.commands.focus();
	}, [editor]);

	const sendHandler = useCallback(async () => {
		if (!editor || editor.isDestroyed || editor.isEmpty || isSending) return;

		const content = editorToMarkdown(editor);
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
	}, [editor, isSending, onSend, clear]);

	const sendRef = useRef(sendHandler);
	sendRef.current = sendHandler;

	useEffect(() => {
		if (!editor || editor.isDestroyed) return;
		editor.storage.sendShortcut.send = () => void sendRef.current();
	}, [editor]);

	useHotkey("Mod+K", () => (!editor?.isFocused ? focus() : undefined), {
		conflictBehavior: "replace",
	});

	return {
		clear,
		editor,
		focus,
		isEmpty,
		isSending,
		sendHandler,
	};
}
