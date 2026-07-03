import { $isCodeNode } from "@lexical/code";
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	defineExtension,
	KEY_ARROW_DOWN_COMMAND,
} from "lexical";

export const ExitCodeBlockExtension = defineExtension({
	name: "@briom/lexical/ExitCodeBlock",
	register(editor) {
		return editor.registerCommand(
			KEY_ARROW_DOWN_COMMAND,
			(event) => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;

				const node = selection.anchor.getNode();
				const parent = node.getParent();
				if (!$isCodeNode(parent)) return false;

				const children = parent.getChildren();
				const lastChild = children[children.length - 1];
				if (node !== lastChild && node.getNextSibling() !== null) {
					return false;
				}

				if (node.getType() === "text") {
					const offset = selection.anchor.offset;
					if (offset < node.getTextContent().length) return false;
				}

				event?.preventDefault();
				editor.update(() => {
					const paragraph = $createParagraphNode();
					parent.insertAfter(paragraph);
					paragraph.select();
				});

				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	},
});
