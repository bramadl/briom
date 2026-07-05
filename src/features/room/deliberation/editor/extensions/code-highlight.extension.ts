import { CodeHighlightNode, CodeNode } from "@lexical/code-core";
import { registerCodeHighlighting } from "@lexical/code-prism";
import { defineExtension } from "lexical";

import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

export const CodeHighlightExtension = defineExtension({
	name: "@briom/lexical/CodeHighlight",
	nodes: [CodeNode, CodeHighlightNode],
	register(editor) {
		return registerCodeHighlighting(editor);
	},
});
