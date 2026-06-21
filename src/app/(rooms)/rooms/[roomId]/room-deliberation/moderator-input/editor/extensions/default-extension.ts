import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export function buildDefaultExtensions(placeholder: string) {
	return [
		StarterKit.configure({
			codeBlock: false,
			heading: false,
			paragraph: {
				HTMLAttributes: { class: "my-2!" },
			},
			link: {
				HTMLAttributes: {
					class: "text-dusty-blue hover:text-dusty-blue/80 cursor-pointer",
				},
			},
			horizontalRule: {
				HTMLAttributes: { class: "my-2! border-border" },
			},
			bulletList: {
				HTMLAttributes: { class: "list-disc pl-5 my-1 space-y-0.5" },
			},
			orderedList: {
				HTMLAttributes: { class: "list-decimal pl-5 my-1! space-y-0.5" },
			},
			code: {
				HTMLAttributes: {
					class: "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]",
				},
			},
		}),
		CodeBlockLowlight.configure({
			lowlight,
			defaultLanguage: "plaintext",
			HTMLAttributes: {
				class: "rounded-lg bg-muted p-3 font-mono text-sm my-2",
			},
		}),
		Placeholder.configure({
			placeholder,
			includeChildren: true,
			showOnlyCurrent: false,
		}),
	];
}
