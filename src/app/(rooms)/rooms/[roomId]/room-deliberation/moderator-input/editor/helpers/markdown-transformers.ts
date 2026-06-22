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
	type TextMatchTransformer,
	UNORDERED_LIST,
} from "@lexical/markdown";

import { $isMentionNode, MentionNode } from "../plugins";

const MENTION_TRANSFORMER: TextMatchTransformer = {
	dependencies: [MentionNode],
	export: (node) => {
		if (!$isMentionNode(node)) return null;
		return `@${node.getMentionLabel()}`;
	},
	regExp: /(?!x)x/,
	type: "text-match",
};

export const IMPORT_TRANSFORMERS = [
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
];

export const EXPORT_TRANSFORMERS = [
	...IMPORT_TRANSFORMERS,
	MENTION_TRANSFORMER,
];
