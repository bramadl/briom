import { AutoFocusExtension } from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { LinkExtension } from "@lexical/link";
import { ListExtension } from "@lexical/list";
import { ReactExtension } from "@lexical/react/ReactExtension";
import { RichTextExtension } from "@lexical/rich-text";
import { configExtension, defineExtension } from "lexical";

import { AutoFormatExtension } from "./auto-format.extension";
import { CodeHighlightExtension } from "./code-highlight.extension";
import { ExitCodeBlockExtension } from "./exit-code-block.extension";
import { ExitInlineFormatExtension } from "./exit-inline-format.extension";
import { ExitListExtension } from "./exit-list.extension";
import { MentionExtension } from "./mention.extension";
import { MentionRoleExtension } from "./mention-role.extension";
import { SendExtension } from "./send.extension";

export const ChatEditorExtension = defineExtension({
	name: "@briom/lexical/ChatEditor",
	namespace: "briom-chat-editor",
	theme: {
		paragraph: "my-1 leading-relaxed",
		code: [
			"not-prose",
			"block rounded-lg bg-muted/60 border border-border/40",
			"px-4 py-3 font-mono text-[0.8rem] leading-relaxed",
			"my-2 overflow-x-auto whitespace-pre",
		].join(" "),
		codeHighlight: {
			keyword: "text-terracotta font-medium",
			string: "text-sage",
			number: "text-dusty-blue",
			function: "text-muted-lavender",
			comment: "text-muted-foreground italic",
			operator: "text-muted-foreground",
			punctuation: "text-muted-foreground",
			tag: "text-rose-400",
			"attr-name": "text-sky-400",
			"attr-value": "text-emerald-400",
			boolean: "text-amber-400",
			"class-name": "text-sky-400",
			regex: "text-emerald-400",
			variable: "text-amber-400",
			plain: "text-foreground",
			property: "text-sky-400",
			namespace: "text-sky-400",
			builtin: "text-sky-400",
			constant: "text-amber-400",
			deleted: "text-rose-400",
			inserted: "text-emerald-400",
			important: "text-rose-400",
			cdata: "text-muted-foreground",
			doctype: "text-muted-foreground",
			prolog: "text-muted-foreground",
			entity: "text-amber-400",
			url: "text-emerald-400",
			symbol: "text-amber-400",
		},
		list: {
			checklist: "pl-0",
			listitem: "mx-6",
			ol: "list-decimal my-1 space-y-0.5",
			ul: "list-disc my-1 space-y-0.5",
		},
		link: "text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer",
		text: {
			bold: "font-semibold",
			code: "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]",
			italic: "italic",
			strikethrough: "line-through",
			underline: "underline underline-offset-2",
			underlineStrikethrough: "underline line-through underline-offset-2",
		},
	},
	dependencies: [
		AutoFocusExtension,
		RichTextExtension,
		HistoryExtension,
		ListExtension,
		LinkExtension,
		configExtension(ReactExtension, { contentEditable: null }),
		SendExtension,
		AutoFormatExtension,
		ExitCodeBlockExtension,
		ExitListExtension,
		ExitInlineFormatExtension,
		MentionExtension,
		MentionRoleExtension,
		CodeHighlightExtension,
	],
});
