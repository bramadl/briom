"use client";

import { $isListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	KEY_ENTER_COMMAND,
} from "lexical";
import { useCallback, useEffect } from "react";

interface KeyboardPluginProps {
	disabled?: boolean;
	mentionMenuOpenRef: React.RefObject<boolean>;
	onSend: () => void;
}

export function KeyboardPlugin({
	onSend,
	mentionMenuOpenRef,
	disabled,
}: KeyboardPluginProps) {
	const [editor] = useLexicalComposerContext();

	const handleEnter = useCallback(
		(event: KeyboardEvent | null): boolean => {
			if (disabled) return false;

			if (mentionMenuOpenRef.current) {
				return false;
			}

			const isInList = editor.getEditorState().read(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;
				const anchorNode = selection.anchor.getNode();
				const parent = anchorNode.getParent();
				return $isListItemNode(parent) || $isListItemNode(anchorNode);
			});

			if (isInList) {
				return false;
			}

			if (event?.shiftKey) {
				return false;
			}

			event?.preventDefault();
			event?.stopPropagation();
			onSend();
			return true;
		},
		[disabled, mentionMenuOpenRef, onSend, editor],
	);

	useEffect(() => {
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			handleEnter,
			COMMAND_PRIORITY_CRITICAL,
		);
	}, [editor, handleEnter]);

	return null;
}
