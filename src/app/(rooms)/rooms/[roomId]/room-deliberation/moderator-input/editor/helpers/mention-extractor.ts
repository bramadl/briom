import type { useEditor } from "@tiptap/react";

import type { JSONNode } from "./json-node";

export interface Mentionee {
	id: string;
	isPrimary: boolean;
	name: string;
}

export function extractMentionees(
	editor: ReturnType<typeof useEditor>,
): Mentionee[] {
	if (!editor) return [];
	const json = editor.getJSON();
	const mentionees: Mentionee[] = [];
	let isFirst = true;

	function traverse(nodes: JSONNode[]) {
		for (const node of nodes) {
			if (node.type === "mention") {
				const id = (node.attrs?.id as string) ?? "";
				const name = (node.attrs?.label as string) ?? "";
				mentionees.push({
					id,
					isPrimary: isFirst,
					name,
				});
				isFirst = false;
			}
			if (node.content) traverse(node.content);
		}
	}

	traverse((json.content ?? []) as JSONNode[]);
	return mentionees;
}
