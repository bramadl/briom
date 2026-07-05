import { $createListItemNode, $isListItemNode } from "@lexical/list";
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	createCommand,
	defineExtension,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
} from "lexical";

export const SUBMIT_COMMAND = createCommand<void>("BRIOM_SUBMIT");

export const SendExtension = defineExtension({
	name: "@briom/lexical/Send",
	register(editor) {
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			(event: KeyboardEvent | null) => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;

				const anchorNode = selection.anchor.getNode();
				if (event?.shiftKey) {
					event.preventDefault();

					const listItem = $isListItemNode(anchorNode)
						? anchorNode
						: anchorNode.getParent();

					if ($isListItemNode(listItem)) {
						if (listItem.getTextContent().trim() === "") {
							const list = listItem.getParent();
							const paragraph = $createParagraphNode();

							list?.insertAfter(paragraph);
							listItem.remove();

							if (list && list.getChildrenSize() === 0) list.remove();
							paragraph.select();
						} else {
							const newItem = $createListItemNode();
							listItem.insertAfter(newItem);
							newItem.select();
						}

						return true;
					}

					editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
					return true;
				}

				event?.preventDefault();
				editor.dispatchCommand(SUBMIT_COMMAND, undefined);
				return true;
			},
			COMMAND_PRIORITY_HIGH,
		);
	},
});
