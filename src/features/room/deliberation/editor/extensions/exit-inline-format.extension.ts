import {
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	COMMAND_PRIORITY_NORMAL,
	defineExtension,
	KEY_ARROW_RIGHT_COMMAND,
} from "lexical";

export const ExitInlineFormatExtension = defineExtension({
	name: "@briom/lexical/ExitInlineFormat",
	register(editor) {
		return editor.registerCommand(
			KEY_ARROW_RIGHT_COMMAND,
			(event) => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;
				if (!selection.isCollapsed()) return false;

				const node = selection.anchor.getNode();
				if (!$isTextNode(node)) return false;

				const offset = selection.anchor.offset;
				if (offset < node.getTextContent().length) return false;
				if (node.getFormat() === 0) return false;

				const nextSibling = node.getNextSibling();
				if (
					nextSibling?.getType() === "text" &&
					$isTextNode(nextSibling) &&
					nextSibling.getFormat() === 0
				) {
					return false;
				}

				event?.preventDefault();
				editor.update(() => {
					const plainNode = $createTextNode(" ");
					plainNode.setFormat(0);
					node.insertAfter(plainNode);
					plainNode.select(1, 1);
				});

				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	},
});
