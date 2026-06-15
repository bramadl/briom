"use client";

import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import type { EditorThemeClasses } from "lexical";
import { useMemo } from "react";

import { ConversationInputBody } from "./conversation-input-body";
import { MentionNode } from "./mention-plugin/mention-node";
import type { ConversationInputProps } from "./types";

const DEFAULT_THEME: EditorThemeClasses = {
	paragraph: "m-0",
	list: {
		listitem: "pl-0.5",
		nested: { listitem: "list-none" },
		ol: "list-decimal pl-5 my-1 space-y-0.5",
		ul: "list-disc pl-5 my-1 space-y-0.5",
	},
	text: {
		bold: "font-semibold",
		code: "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground/90",
		italic: "italic",
		strikethrough: "line-through",
		underline: "underline underline-offset-2",
	},
};

export function ConversationInput({
	disabled,
	editorTheme,
	isStreaming,
	namespace = "ConversationInput",
	onAbort,
	onSend,
	participants,
	placeholder = "Bring something into the discussion... (use @ to mention a model)",
}: ConversationInputProps) {
	const initialConfig = useMemo(
		() => ({
			namespace,
			nodes: [MentionNode, ListNode, ListItemNode],
			onError: (error: Error) => {
				throw error;
			},
			theme: { ...DEFAULT_THEME, ...editorTheme },
		}),
		[editorTheme, namespace],
	);

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<ConversationInputBody
				disabled={disabled}
				isStreaming={isStreaming}
				onAbort={onAbort}
				onSend={onSend}
				participants={participants}
				placeholder={placeholder}
			/>
		</LexicalComposer>
	);
}
