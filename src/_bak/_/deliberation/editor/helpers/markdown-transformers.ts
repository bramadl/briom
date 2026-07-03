import {
	BOLD_ITALIC_STAR,
	BOLD_ITALIC_UNDERSCORE,
	BOLD_STAR,
	BOLD_UNDERSCORE,
	CODE,
	INLINE_CODE,
	ITALIC_STAR,
	ITALIC_UNDERSCORE,
	LINK,
	ORDERED_LIST,
	STRIKETHROUGH,
	UNORDERED_LIST,
} from "@lexical/markdown";
import type { LexicalNode } from "lexical";

import { $isMentionNode, MentionNode } from "../nodes/mention.node";

const MENTION_TRANSFORMER = {
	dependencies: [MentionNode],
	export: (node: LexicalNode) => {
		if (!$isMentionNode(node)) return null;
		return `@${node.getMentionLabel()}`;
	},
	regExp: /(?!x)x/,
	type: "text-match" as const,
};

export const EXPORT_TRANSFORMERS = [
	CODE,
	UNORDERED_LIST,
	ORDERED_LIST,
	BOLD_ITALIC_STAR,
	BOLD_ITALIC_UNDERSCORE,
	BOLD_STAR,
	BOLD_UNDERSCORE,
	ITALIC_STAR,
	ITALIC_UNDERSCORE,
	STRIKETHROUGH,
	INLINE_CODE,
	LINK,
	MENTION_TRANSFORMER,
];
