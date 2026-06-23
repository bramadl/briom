import { $dfs } from "@lexical/utils";
import { defineExtension } from "lexical";

import { $isMentionNode, MentionNode } from "../nodes/mention.node";

export const MentionRoleExtension = defineExtension({
	name: "@briom/lexical/MentionRole",
	register(editor) {
		return editor.registerNodeTransform(MentionNode, () => {
			let isFirst = true;
			for (const { node } of $dfs()) {
				if (!$isMentionNode(node)) continue;
				if (node.getIsPrimary() !== isFirst) {
					node.getWritable().setIsPrimary(isFirst);
				}
				isFirst = false;
			}
		});
	},
});
