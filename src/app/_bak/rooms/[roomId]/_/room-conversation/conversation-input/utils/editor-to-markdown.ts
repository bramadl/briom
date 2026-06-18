import type { Editor } from "@tiptap/react";

type JSONNode = {
	type?: string;
	text?: string;
	content?: JSONNode[];
	attrs?: Record<string, unknown>;
	marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function nodesToMarkdown(nodes: JSONNode[]): string {
	return nodes.map(nodeToMarkdown).join("");
}

function nodeToMarkdown(node: JSONNode): string {
	switch (node.type) {
		case "paragraph":
			return `${nodesToMarkdown(node.content ?? [])}\n`;

		case "bulletList":
			return (node.content ?? [])
				.map(
					(item) =>
						`- ${nodesToMarkdown(item.content ?? []).replace(/\n$/, "")}\n`,
				)
				.join("");

		case "orderedList":
			return (node.content ?? [])
				.map(
					(item, i) =>
						`${i + 1}. ${nodesToMarkdown(item.content ?? []).replace(/\n$/, "")}\n`,
				)
				.join("");

		case "listItem":
			return nodesToMarkdown(node.content ?? []);

		case "codeBlock": {
			const lang = (node.attrs?.language as string) || "";
			const code = nodesToMarkdown(node.content ?? []).replace(/\n+$/, "");

			return `\`\`\`${lang}\n${code}${code ? "\n" : ""}\`\`\`\n`;
		}

		case "hardBreak":
			return "\n";

		case "mention":
			return `@${node.attrs?.label ?? ""}`;

		case "text": {
			let text = node.text ?? "";
			for (const mark of node.marks ?? []) {
				switch (mark.type) {
					case "bold":
						text = `**${text}**`;
						break;
					case "italic":
						text = `_${text}_`;
						break;
					case "strike":
						text = `~~${text}~~`;
						break;
					case "code":
						text = `\`${text}\``;
						break;
					case "underline":
						text = `<u>${text}</u>`;
						break;
				}
			}
			return text;
		}

		default:
			return nodesToMarkdown(node.content ?? []);
	}
}

export function editorToMarkdown(editor: Editor): string {
	const json = editor.getJSON();
	return nodesToMarkdown((json.content ?? []) as JSONNode[]);
}
