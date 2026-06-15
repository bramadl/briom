"use client";

import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createParagraphNode,
	$getRoot,
	$getSelection,
	$isRangeSelection,
	type EditorState,
} from "lexical";
import { useCallback, useEffect, useState } from "react";

import { CONVERSATION_INPUT_TRANSFORMERS } from "./markdown-plugin/markdown-transformer";
import { $isMentionNode } from "./mention-plugin/mention-node";
import type { SendHandler } from "./types";

interface UseSendHandlerOptions {
	disabled?: boolean;
	isStreaming?: boolean;
	onAfterSend?: () => void;
	onSend: SendHandler;
}

interface UseSendHandlerResult {
	handleChange: (editorState: EditorState) => void;
	handleSend: () => Promise<void>;
	isDisabled: boolean;
	isEmpty: boolean;
	sending: boolean;
}

export function useSendHandler({
	disabled,
	isStreaming,
	onSend,
	onAfterSend,
}: UseSendHandlerOptions): UseSendHandlerResult {
	const [editor] = useLexicalComposerContext();

	const [isEmpty, setIsEmpty] = useState(true);
	const [sending, setSending] = useState(false);

	const isDisabled = Boolean(disabled || isStreaming || sending);

	const handleChange = useCallback((editorState: EditorState) => {
		editorState.read(() => {
			const root = $getRoot();
			setIsEmpty(root.getTextContent().trim().length === 0);
		});
	}, []);

	useEffect(() => {
		if (!isEmpty) return;

		const timeout = setTimeout(() => {
			editor.update(() => {
				const root = $getRoot();
				if (root.getTextContent().trim().length === 0) {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						selection.setFormat(0);
					}
				}
			});
		}, 0);

		return () => clearTimeout(timeout);
	}, [isEmpty, editor]);

	const handleSend = useCallback(async () => {
		if (isEmpty || isDisabled) return;

		const { content, firstMentionedParticipantId } = editor
			.getEditorState()
			.read(() => {
				const root = $getRoot();

				if (root.getTextContent().trim().length === 0) {
					return { content: "", firstMentionedParticipantId: null };
				}

				let firstMentionedParticipantId: string | null = null;
				for (const node of root.getAllTextNodes()) {
					if ($isMentionNode(node) && node.__mentionKind === "participant") {
						firstMentionedParticipantId = node.__mentionKey;
						break;
					}
				}

				return {
					content: $convertToMarkdownString(
						CONVERSATION_INPUT_TRANSFORMERS,
						undefined,
						true,
					),
					firstMentionedParticipantId,
				};
			});

		if (!content) return;

		setSending(true);
		try {
			await onSend(content, firstMentionedParticipantId ?? undefined);
			editor.update(() => {
				const root = $getRoot();
				root.clear();
				const paragraph = $createParagraphNode();
				root.append(paragraph);
				paragraph.select();
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					selection.setFormat(0);
				}
			});
		} finally {
			setSending(false);
			onAfterSend?.();
		}
	}, [editor, isEmpty, isDisabled, onSend, onAfterSend]);

	return { handleChange, handleSend, isDisabled, isEmpty, sending };
}
