"use client";

import { cn } from "@briom/libs/utils";
import { Button } from "@briom/ui/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ArrowUp, LoaderCircle, OctagonX } from "lucide-react";
import { useEffect, useRef } from "react";

import { KeyboardPlugin } from "./keyboard-plugin";
import { MarkdownHotkeysPlugin } from "./markdown-plugin";
import { CONVERSATION_INPUT_TRANSFORMERS } from "./markdown-plugin/markdown-transformer";
import { MentionPlugin } from "./mention-plugin";
import type { ConversationInputProps } from "./types";
import { useSendHandler } from "./use-send-handler";

type ConversationInputBodyProps = Required<
	Pick<ConversationInputProps, "placeholder">
> &
	Omit<ConversationInputProps, "editorTheme" | "namespace" | "placeholder">;

export function ConversationInputBody({
	disabled,
	isStreaming,
	onAbort,
	onSend,
	participants,
	placeholder,
}: ConversationInputBodyProps) {
	const [editor] = useLexicalComposerContext();
	const firstMentionedRef = useRef<string | null>(null);

	const { handleChange, handleSend, isDisabled, isEmpty, sending } =
		useSendHandler({
			disabled,
			isStreaming,
			onSend,
			onAfterSend: () => {
				firstMentionedRef.current = null;
			},
		});

	const mentionMenuOpenRef = useRef(false);

	// CMD+K = focus editor
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				e.stopPropagation();
				editor.focus();
			}
		};
		document.addEventListener("keydown", handler, true);
		return () => document.removeEventListener("keydown", handler, true);
	}, [editor]);

	return (
		<div
			className={cn(
				"relative max-w-3xl mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
				"focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5",
			)}
		>
			<div className="relative">
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className={cn(
								"min-h-[3.5rem] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-foreground",
								"focus:outline-none",
								"font-sans leading-relaxed",
								isDisabled && "opacity-50",
							)}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
					placeholder={
						<div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground/40">
							{placeholder}
						</div>
					}
				/>
			</div>

			<OnChangePlugin onChange={handleChange} />
			<HistoryPlugin />
			<ListPlugin />
			<MarkdownShortcutPlugin transformers={CONVERSATION_INPUT_TRANSFORMERS} />
			<MarkdownHotkeysPlugin />

			<MentionPlugin
				firstMentionedRef={firstMentionedRef}
				menuOpenRef={mentionMenuOpenRef}
				participants={participants}
			/>

			<KeyboardPlugin
				disabled={isDisabled}
				mentionMenuOpenRef={mentionMenuOpenRef}
				onSend={handleSend}
			/>

			<div className="flex items-center justify-between px-3 pb-2.5">
				<span className="text-[10px] text-muted-foreground/30 font-mono">
					↵ send · shift+↵ newline · @ mention · **bold** · _italic_ · `code` ·
					⌘K focus
				</span>
				<Button
					className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={isStreaming ? false : isEmpty || isDisabled}
					onClick={isStreaming ? onAbort : handleSend}
					size="icon"
				>
					{isStreaming ? (
						<OctagonX className="fill-current" />
					) : sending ? (
						<LoaderCircle className="animate-spin" />
					) : (
						<ArrowUp />
					)}
				</Button>
			</div>
		</div>
	);
}
