"use client";

import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	COMMAND_PRIORITY_NORMAL,
	FORMAT_TEXT_COMMAND,
	KEY_DOWN_COMMAND,
} from "lexical";
import { useEffect } from "react";

export function MarkdownHotkeysPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				const isModifier = event.metaKey || event.ctrlKey;
				if (!isModifier) return false;

				const key = event.key.toLowerCase();

				if (key === "b") {
					event.preventDefault();
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
					return true;
				}

				if (key === "i") {
					event.preventDefault();
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
					return true;
				}

				if (key === "u") {
					event.preventDefault();
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
					return true;
				}

				if (key === "x" && event.shiftKey) {
					event.preventDefault();
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
					return true;
				}

				if (event.shiftKey) {
					if (key === "7") {
						event.preventDefault();
						editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
						return true;
					}
					if (key === "8") {
						event.preventDefault();
						editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
						return true;
					}
					if (key === "9") {
						event.preventDefault();
						editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
						return true;
					}
				}

				return false;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	}, [editor]);

	return null;
}
