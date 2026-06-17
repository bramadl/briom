"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";

import type { SendHandler } from "./types";
import { editorToMarkdown } from "./utils/editor-to-markdown";

interface UseSendHandlerOptions {
	disabled?: boolean;
	editor: Editor | null;
	isStreaming?: boolean;
	onAfterSend?: () => void;
	onSend: SendHandler;
}

interface UseSendHandlerResult {
	handleSend: () => Promise<void>;
	isDisabled: boolean;
	isEmpty: boolean;
	sending: boolean;
}

export function useSendHandler({
	disabled,
	editor,
	isStreaming,
	onSend,
	onAfterSend,
}: UseSendHandlerOptions): UseSendHandlerResult {
	const [sending, setSending] = useState(false);

	const isDisabled = Boolean(disabled || isStreaming || sending);
	const isEmpty = editor?.isEmpty ?? true;

	const handleSend = useCallback(async () => {
		if (!editor || editor.isEmpty || isDisabled) return;

		const content = editorToMarkdown(editor);
		if (!content.trim()) return;

		let firstMentionedParticipantId: string | undefined;
		editor.state.doc.descendants((node) => {
			if (node.type.name === "mention" && !firstMentionedParticipantId) {
				firstMentionedParticipantId = node.attrs.id as string;
			}
		});

		setSending(true);
		try {
			const sent = await onSend(content, firstMentionedParticipantId);
			if (sent) {
				editor.commands.setContent("");
				editor.commands.setTextSelection(0);
				editor.commands.blur();
				requestAnimationFrame(() => {
					editor.commands.focus("start");
				});
			}
		} finally {
			setSending(false);
			onAfterSend?.();
		}
	}, [editor, isDisabled, onSend, onAfterSend]);

	return { handleSend, isDisabled, isEmpty, sending };
}
