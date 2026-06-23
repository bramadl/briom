import {
	CodeHighlightNode,
	CodeNode,
	CodeExtension as LexicalCodeExtension,
} from "@lexical/code";
import { defineExtension } from "lexical";

export const CodeExtension = defineExtension({
	name: "@briom/lexical/Code",
	dependencies: [LexicalCodeExtension],
	nodes: () => [CodeNode, CodeHighlightNode],
});
