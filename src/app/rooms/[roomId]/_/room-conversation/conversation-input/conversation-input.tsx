"use client";

import { cn } from "@briom/libs/utils";
import { Button } from "@briom/ui/button";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { ArrowUpIcon, LoaderCircleIcon, SquareIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { buildMentionExtension } from "./extensions/mention.extension";
import type { ConversationInputProps } from "./types";
import { useSendHandler } from "./use-send-handler";
import { makePlaceholder } from "./utils/make-placeholder";

const lowlight = createLowlight(common);

export function ConversationInput({
	disabled,
	isStreaming,
	onAbort,
	onSend,
	participants,
}: ConversationInputProps) {
	const mentionMenuOpenRef = useRef(false);
	const handleSendRef = useRef<() => Promise<void>>(async () => {});

	const multiDiscussionRoom = participants.length > 1;
	const tips = [
		"⌘↵ send",
		"↵ newline",
		...(multiDiscussionRoom ? ["@ mention"] : []),
		"**bold**",
		"_italic_",
		"`code`",
		"⌘K focus",
	];

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false,
				heading: false,
				paragraph: {
					HTMLAttributes: {
						class: "my-2!",
					},
				},
				link: {
					HTMLAttributes: {
						class: "text-dusty-blue hover:text-dusty-blue/80 cursor-pointer",
					},
				},
				horizontalRule: {
					HTMLAttributes: {
						class: "my-2! border-border",
					},
				},
				// codeBlock: {
				// 	HTMLAttributes: {
				// 		class:
				// 			"rounded-lg bg-muted p-3 font-mono text-sm my-2 pointer-events-none",
				// 	},
				// 	enableTabIndentation: true,
				// },
				bulletList: {
					HTMLAttributes: {
						class: "list-disc pl-5 my-1 space-y-0.5",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal pl-5 my-1! space-y-0.5",
					},
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
					class:
						"rounded-lg bg-muted p-3 font-mono text-sm my-2 pointer-events-none",
				},
			}),
			Placeholder.configure({
				placeholder: makePlaceholder(participants.length),
				includeChildren: true,
				showOnlyCurrent: false,
			}),
			...(multiDiscussionRoom
				? [buildMentionExtension(participants, mentionMenuOpenRef)]
				: []),
		],
		editorProps: {
			attributes: {
				class: cn(
					"min-h-[3.5rem] max-h-[36rem] w-full bg-transparent px-4 pt-3 pb-2 text-sm",
					"overflow-y-auto focus:outline-none font-sans leading-relaxed",
					"prose prose-sm dark:prose-invert max-w-none",
					"prose-p:my-0 prose-p:leading-relaxed",

					"[&>p.is-editor-empty:only-child]:before:content-[attr(data-placeholder)]",
					"[&>p.is-editor-empty:only-child]:before:float-left",
					"[&>p.is-editor-empty:only-child]:before:text-muted-foreground/30",
					"[&>p.is-editor-empty:only-child]:before:pointer-events-none",
					"[&>p.is-editor-empty:only-child]:before:h-0",
				),
			},
			handleKeyDown(_view, event) {
				if (mentionMenuOpenRef.current) return false;
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					void handleSendRef.current();
					return true;
				}

				return false;
			},
		},
		onUpdate({ editor }) {
			if (editor.isEmpty) {
				editor.chain().focus().insertContent("<p></p>").run();
			}
		},
	});

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				e.stopPropagation();
				editor?.commands.focus();
			}
		};

		document.addEventListener("keydown", handler, true);
		return () => document.removeEventListener("keydown", handler, true);
	}, [editor]);

	const { handleSend, isDisabled, isEmpty, sending } = useSendHandler({
		disabled,
		editor,
		isStreaming,
		onSend,
	});

	useEffect(() => {
		handleSendRef.current = handleSend;
	}, [handleSend]);

	if (!editor) return null;

	return (
		<div
			className={cn(
				"relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
				"focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5",
				isDisabled && "opacity-50",
			)}
		>
			<EditorContent editor={editor} />
			<div className="flex items-center justify-between px-3 pb-2.5">
				<span className="text-[10px] text-muted-foreground/30 font-mono">
					{tips.join(" · ")}
				</span>
				<Button
					className="group/button h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={isStreaming ? false : isEmpty || isDisabled}
					onClick={isStreaming ? onAbort : handleSend}
					size="icon"
				>
					{isStreaming ? (
						<SquareIcon className="fill-current" />
					) : sending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : (
						<ArrowUpIcon />
					)}
				</Button>
			</div>
		</div>
	);
}
