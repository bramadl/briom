import { $convertToMarkdownString } from "@lexical/markdown";
import type { LexicalEditor } from "lexical";

import { EXPORT_TRANSFORMERS } from "./markdown-transformers";

export function editorStateToMarkdown(editor: LexicalEditor | null): string {
	if (!editor) return "";
	return editor
		.getEditorState()
		.read(() => $convertToMarkdownString(EXPORT_TRANSFORMERS));
}
