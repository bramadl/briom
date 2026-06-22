import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";

import { MentionNode } from "./plugins/mention-plugin/mention-node";

export const moderatorEditorNodes = [
	CodeNode,
	CodeHighlightNode,
	ListNode,
	ListItemNode,
	LinkNode,
	MentionNode,
];
