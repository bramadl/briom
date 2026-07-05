import { $dfs } from "@lexical/utils";
import type { LexicalEditor } from "lexical";

import { $isMentionNode } from "../nodes/mention.node";

export interface Mentionee {
	id: string;
	isPrimary: boolean;
	name: string;
}

export function extractMentionees(editor: LexicalEditor | null): Mentionee[] {
	if (!editor) return [];
	return editor.getEditorState().read(() => {
		const mentionees: Mentionee[] = [];
		let isFirst = true;
		for (const { node } of $dfs()) {
			if (!$isMentionNode(node)) continue;
			mentionees.push({
				id: node.getMentionId(),
				isPrimary: isFirst,
				name: node.getMentionLabel(),
			});
			isFirst = false;
		}
		return mentionees;
	});
}
