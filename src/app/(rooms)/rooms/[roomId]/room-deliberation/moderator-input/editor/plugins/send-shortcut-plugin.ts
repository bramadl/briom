"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	COMMAND_PRIORITY_NORMAL,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect } from "react";

interface SendShortcutPluginProps {
	onSend: () => void;
}

/**
 * Enter → send.
 * Shift+Enter → new paragraph (dispatches INSERT_PARAGRAPH_COMMAND).
 *
 * Why dispatch INSERT_PARAGRAPH_COMMAND instead of falling through?
 *
 * Falling through to Lexical's default Enter handling inserts a
 * LineBreakNode (<br>) inside the current paragraph. That's wrong for a
 * chat composer because:
 *   1. Markdown shortcuts (``` → code block, `1.` → list, `- ` → list)
 *      are triggered by INSERT_PARAGRAPH_COMMAND via MarkdownShortcutPlugin.
 *      A LineBreakNode in the middle of a paragraph never fires that command,
 *      so shortcuts never trigger after a Shift+Enter.
 *   2. ListPlugin handles INSERT_PARAGRAPH_COMMAND to add new list items and
 *      to exit the list on an empty item -- a LineBreakNode triggers neither.
 *   3. CodeNode handles INSERT_PARAGRAPH_COMMAND to append a newline within
 *      the code block, and exits the block on the second empty line.
 *
 * Dispatching INSERT_PARAGRAPH_COMMAND from here makes all of the above work
 * naturally via the plugins that already own those responsibilities.
 *
 * Priority note: registered at COMMAND_PRIORITY_NORMAL (2).
 * The mention typeahead plugin registers at COMMAND_PRIORITY_HIGH (3), so
 * it still wins KEY_ENTER_COMMAND when the @mention popup is open.
 */
export function SendShortcutPlugin({ onSend }: SendShortcutPluginProps) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			(event) => {
				if (event?.isComposing) return false;

				if (event?.shiftKey) {
					// Let MarkdownShortcutPlugin / ListPlugin / CodeNode handle it
					event.preventDefault();
					editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
					return true;
				}

				// Plain Enter → send
				event?.preventDefault();
				onSend();
				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	}, [editor, onSend]);

	return null;
}
