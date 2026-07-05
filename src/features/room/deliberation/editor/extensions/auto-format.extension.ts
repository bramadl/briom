import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $createHorizontalRuleNode } from "@lexical/extension";
import { $createListItemNode, $createListNode } from "@lexical/list";
import {
	$createParagraphNode,
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	defineExtension,
	KEY_DOWN_COMMAND,
} from "lexical";

export const AutoFormatExtension = defineExtension({
	name: "@briom/lexical/AutoFormat",
	register(editor) {
		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				const isSpace = event.key === " ";
				const isShiftEnter = event.key === "Enter" && event.shiftKey;
				if (!isSpace && !isShiftEnter) return false;

				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;

				const node = selection.anchor.getNode();
				if (node.getType() !== "text") return false;

				const parent = node.getParent();
				if ($isCodeNode(parent) || $isCodeNode(node)) return false;

				const text = node.getTextContent();
				const offset = selection.anchor.offset;
				const beforeCursor = text.slice(0, offset);
				const afterCursor = text.slice(offset);

				if (isSpace) {
					if (/^(1\.|-)$/.test(beforeCursor)) {
						event.preventDefault();
						const isOrdered = beforeCursor === "1.";

						editor.update(() => {
							const list = $createListNode(isOrdered ? "number" : "bullet");
							const item = $createListItemNode();
							list.append(item);

							const paragraph = node.getParent();
							if (paragraph) paragraph.replace(list);
							item.select();
						});

						return true;
					}

					const codeMatch = beforeCursor.match(/^```(\w*)$/);
					if (codeMatch) {
						event.preventDefault();
						const language = codeMatch[1] || undefined;

						editor.update(() => {
							const code = $createCodeNode(language);
							const paragraph = node.getParent();
							if (paragraph) paragraph.replace(code);
							code.select();
						});

						return true;
					}

					if (beforeCursor === "---") {
						event.preventDefault();
						editor.update(() => {
							const hr = $createHorizontalRuleNode();
							const paragraph = node.getParent();

							if (paragraph) {
								paragraph.insertAfter(hr);
								const p = $createParagraphNode();

								hr.insertAfter(p);
								p.select();
								paragraph.remove();
							}
						});

						return true;
					}

					const inlineMatch = beforeCursor.match(/`([^`]+)`$/);
					if (inlineMatch) {
						event.preventDefault();
						const codeText = inlineMatch[1];
						const startIdx = inlineMatch.index;
						const before = beforeCursor.slice(0, startIdx);

						editor.update(() => {
							const code = $createTextNode(codeText);
							code.setFormat("code");

							if (before !== "") {
								const beforeNode = $createTextNode(before);

								node.replace(beforeNode);
								beforeNode.insertAfter(code);
							} else {
								node.replace(code);
							}

							const trailingText = afterCursor ? ` ${afterCursor}` : " ";
							const spaceNode = $createTextNode(trailingText);
							code.insertAfter(spaceNode);

							spaceNode.select(1, 1);
						});

						return true;
					}
				}

				if (isShiftEnter) {
					const codeMatch = beforeCursor.match(/^```(\w*)$/);
					if (codeMatch) {
						event.preventDefault();
						const language = codeMatch[1] || undefined;

						editor.update(() => {
							const code = $createCodeNode(language);
							const paragraph = node.getParent();

							if (paragraph) paragraph.replace(code);
							code.select();
						});

						return true;
					}

					if (beforeCursor === "---") {
						event.preventDefault();
						editor.update(() => {
							const hr = $createHorizontalRuleNode();
							const paragraph = node.getParent();

							if (paragraph) {
								paragraph.insertAfter(hr);
								const p = $createParagraphNode();

								hr.insertAfter(p);
								p.select();
								paragraph.remove();
							}
						});

						return true;
					}
				}

				return false;
			},
			COMMAND_PRIORITY_HIGH,
		);
	},
});
