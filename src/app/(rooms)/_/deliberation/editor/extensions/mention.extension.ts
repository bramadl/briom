import {
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	defineExtension,
	KEY_DOWN_COMMAND,
} from "lexical";

import { $createMentionNode, MentionNode } from "../nodes/mention.node";
import { getMentionStore } from "../store/mention.store";

export const INSERT_MENTION_COMMAND = createCommand<{
	id: string;
	label: string;
}>("INSERT_MENTION");

export const MentionExtension = defineExtension({
	name: "@briom/lexical/Mention",
	nodes: [MentionNode],
	register(editor) {
		const store = getMentionStore(editor);

		const updateListener = editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) {
					store.visible.value = false;
					return;
				}

				const node = selection.anchor.getNode();
				if (node.getType() !== "text") {
					store.visible.value = false;
					return;
				}

				const text = node.getTextContent();
				const offset = selection.anchor.offset;
				const before = text.slice(0, offset);
				const atIndex = before.lastIndexOf("@");

				if (atIndex === -1) {
					store.visible.value = false;
					return;
				}

				const query = before.slice(atIndex + 1);
				if (query.includes(" ")) {
					store.visible.value = false;
					return;
				}

				const nativeSelection = window.getSelection();
				let rect: DOMRect | null = null;
				if (nativeSelection && nativeSelection.rangeCount > 0) {
					rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
				}

				const popupHeight = 220;
				const spaceBelow = window.innerHeight - (rect?.bottom ?? 0);
				const above = spaceBelow < popupHeight;

				store.query.value = query;
				store.rect.value = rect;
				store.above.value = above;
				store.visible.value = true;
				store.selectedIndex.value = 0;
			});
		});

		const commandListener = editor.registerCommand(
			INSERT_MENTION_COMMAND,
			(payload) => {
				editor.update(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					const node = selection.anchor.getNode();
					if (node.getType() !== "text") return;

					const text = node.getTextContent();
					const offset = selection.anchor.offset;
					const before = text.slice(0, offset);
					const atIndex = before.lastIndexOf("@");
					if (atIndex === -1) return;

					const beforeAt = text.slice(0, atIndex);
					const afterCursor = text.slice(offset);

					const mention = $createMentionNode(payload.id, payload.label);
					if (beforeAt === "") {
						node.replace(mention);
					} else {
						const beforeNode = $createTextNode(beforeAt);
						node.replace(beforeNode);
						beforeNode.insertAfter(mention);
					}

					const trailingText = afterCursor ? ` ${afterCursor}` : " ";
					const spaceNode = $createTextNode(trailingText);
					mention.insertAfter(spaceNode);

					spaceNode.select(1, 1);
				});

				store.visible.value = false;
				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);

		const keyListener = editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				if (event.key === "Escape" && store.visible.value) {
					store.visible.value = false;
					return true;
				}
				return false;
			},
			COMMAND_PRIORITY_NORMAL,
		);

		return () => {
			updateListener();
			commandListener();
			keyListener();
		};
	},
});
