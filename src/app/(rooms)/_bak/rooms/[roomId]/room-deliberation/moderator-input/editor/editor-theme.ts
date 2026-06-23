import type { EditorThemeClasses } from "lexical";

/**
 * Class names applied to editor DOM elements by Lexical's reconciler.
 *
 * Why no `prose` class on ContentEditable:
 *   Tailwind Typography's `prose dark:prose-invert` sets
 *   `--tw-prose-code: white` in dark mode and applies
 *   `code { font-weight: 600 }` globally — overriding all the syntax
 *   highlight `text-*` colors on CodeHighlightNode spans. The theme here
 *   owns all editor element styling directly instead.
 */
export const moderatorEditorTheme: EditorThemeClasses = {
	// ── Block elements ───────────────────────────────────────────────────────
	paragraph: "my-1 leading-relaxed",

	// ── Code blocks ──────────────────────────────────────────────────────────
	// `not-prose` stops Tailwind Typography from re-applying font-weight/color
	// to descendant spans in case a `prose` parent is above the editor.
	code: [
		"not-prose",
		"block rounded-lg bg-muted/60 border border-border/40",
		"px-4 py-3 font-mono text-[0.8rem] leading-relaxed",
		"my-2 overflow-x-auto whitespace-pre",
	].join(" "),

	codeHighlight: {
		// Syntax token → Tailwind colour. These are scanned statically by
		// Tailwind's JIT so they end up in the CSS bundle as long as theme.ts
		// is inside the `content` glob (the default Next.js config covers
		// `src/**/*.{ts,tsx}` so no extra config needed).
		atrule: "text-sky-400",
		attr: "text-sky-400",
		"attr-name": "text-sky-400",
		"attr-value": "text-emerald-400",
		boolean: "text-amber-400",
		builtin: "text-sky-400",
		cdata: "text-zinc-500",
		char: "text-emerald-400",
		class: "text-sky-400",
		"class-name": "text-sky-400",
		comment: "text-zinc-500 italic",
		constant: "text-amber-400",
		deleted: "text-rose-400",
		doctype: "text-zinc-500",
		entity: "text-amber-400",
		function: "text-amber-400",
		important: "text-rose-400",
		inserted: "text-emerald-400",
		keyword: "text-sky-400",
		namespace: "text-sky-400",
		number: "text-amber-400",
		operator: "text-zinc-300",
		plain: "text-zinc-200",
		prolog: "text-zinc-500",
		property: "text-sky-400",
		punctuation: "text-zinc-500",
		regex: "text-emerald-400",
		selector: "text-emerald-400",
		string: "text-emerald-400",
		symbol: "text-amber-400",
		tag: "text-rose-400",
		url: "text-emerald-400",
		variable: "text-amber-400",
	},

	// ── Lists ────────────────────────────────────────────────────────────────
	list: {
		checklist: "pl-0",
		listitem: "mx-6",
		listitemChecked:
			"line-through opacity-50 relative list-none before:absolute before:-left-5 before:content-['✓']",
		listitemUnchecked:
			"relative list-none before:absolute before:-left-5 before:content-['○']",
		nested: {
			listitem: "list-none",
		},
		ol: "list-decimal my-1 space-y-0.5",
		ul: "list-disc my-1 space-y-0.5",
	},

	// ── Inline ───────────────────────────────────────────────────────────────
	link: "text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer",
	text: {
		bold: "font-semibold",
		code: "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] not-prose",
		italic: "italic",
		strikethrough: "line-through",
		underline: "underline underline-offset-2",
		underlineStrikethrough: "underline line-through underline-offset-2",
	},
};
