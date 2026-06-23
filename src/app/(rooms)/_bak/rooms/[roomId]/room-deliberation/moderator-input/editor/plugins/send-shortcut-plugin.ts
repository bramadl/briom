"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	COMMAND_PRIORITY_BEFORE_EDITOR,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect } from "react";

interface SendShortcutPluginProps {
	onSend: () => void;
}

/**
 * Enter → send.
 * Shift+Enter → new paragraph (INSERT_PARAGRAPH_COMMAND).
 *
 * Priority: COMMAND_PRIORITY_BEFORE_EDITOR
 * ─────────────────────────────────────────
 * This is the EDITOR (0) bucket with `addFront` insertion, meaning within
 * the EDITOR priority group this plugin's handler runs first. Commands are
 * dispatched highest-priority-first (4 → 0), so the full chain is:
 *
 *   HIGH  (3): LexicalTypeaheadMenuPlugin  ← wins when @mention popup open
 *   LOW   (1): MarkdownShortcutPlugin      ← matches ``` / `1.` / `- ` etc.
 *              If a pattern matches, it returns true and we never see Enter.
 *   EDITOR(0)→front: SendShortcutPlugin    ← plain Enter → send
 *   EDITOR(0)→back:  RichTextPlugin        ← unreachable for Enter (we win)
 *
 * Previously at COMMAND_PRIORITY_NORMAL (2), we ran before MarkdownShortcut
 * and broke all element shortcuts (``` + Enter, `1.` + Enter, etc.).
 *
 * Shift+Enter dispatches INSERT_PARAGRAPH_COMMAND instead of falling through
 * to RichTextPlugin's INSERT_LINE_BREAK_COMMAND, because:
 *   - INSERT_LINE_BREAK_COMMAND inserts a raw <br> (LineBreakNode), which
 *     does NOT trigger MarkdownShortcutPlugin's element transforms.
 *   - INSERT_PARAGRAPH_COMMAND creates a proper new paragraph, which is what
 *     ListPlugin and CodeNode both respond to for "new item" / "new line in
 *     code block" / "exit block on empty line" behaviours.
 */
export function SendShortcutPlugin({ onSend }: SendShortcutPluginProps) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			(event) => {
				if (event?.isComposing) return false;

				if (event?.shiftKey) {
					event.preventDefault();
					editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
					return true;
				}

				// Plain Enter → send (only if MarkdownShortcutPlugin didn't match)
				event?.preventDefault();
				onSend();
				return true;
			},
			COMMAND_PRIORITY_BEFORE_EDITOR,
		);
	}, [editor, onSend]);

	return null;
}
