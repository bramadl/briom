import { $isListItemNode } from "@lexical/list";
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	defineExtension,
	KEY_ARROW_DOWN_COMMAND,
} from "lexical";

export const ExitListExtension = defineExtension({
	name: "@briom/lexical/ExitList",
	register(editor) {
		return editor.registerCommand(
			KEY_ARROW_DOWN_COMMAND,
			(event) => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;

				const node = selection.anchor.getNode();
				const listItem = $isListItemNode(node) ? node : node.getParent();
				if (!$isListItemNode(listItem)) return false;

				if (listItem.getNextSibling()) return false;
				if (node.getType() === "text") {
					const offset = selection.anchor.offset;
					if (offset < node.getTextContent().length) return false;
				}

				event?.preventDefault();
				editor.update(() => {
					const list = listItem.getParent();
					const paragraph = $createParagraphNode();

					const children = listItem.getChildren();
					for (const child of [...children]) {
						paragraph.append(child);
					}

					list?.insertAfter(paragraph);
					listItem.remove();
					if (list && list.getChildrenSize() === 0) {
						list.remove();
					}
					paragraph.select();
				});
				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	},
});
