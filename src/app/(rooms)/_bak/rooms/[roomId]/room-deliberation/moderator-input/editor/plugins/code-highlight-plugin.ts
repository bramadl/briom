"use client";

import { registerCodeIndentation } from "@lexical/code-core";
import { registerCodeHighlighting } from "@lexical/code-prism";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";

export function CodeHighlightPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return mergeRegister(
			registerCodeHighlighting(editor),
			registerCodeIndentation(editor),
		);
	}, [editor]);

	return null;
}
