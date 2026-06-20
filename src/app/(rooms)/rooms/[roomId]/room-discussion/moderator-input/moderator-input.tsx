"use client";

import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef, useState } from "react";

import { EditorSendButton, EditorTips } from "./editor";
import {
	buildDefaultExtension,
	buildMentionExtension,
} from "./editor/extensions";

interface ModeratorInputProps {
	isMultiDiscussionRoom?: boolean;
	participants: RoomDTO["participants"];
}

export function ModeratorInput({
	isMultiDiscussionRoom,
	participants,
}: ModeratorInputProps) {
	const placeholder = "lorem ipsum dolor sit amet";
	const [editorReady, setEditorReady] = useState<boolean>(false);

	const handleSendRef = useRef<() => Promise<void>>(async () => {});
	const mentionMenuOpenRef = useRef(false);

	const editor = useEditor({
		extensions: [
			...buildDefaultExtension(placeholder),
			...(isMultiDiscussionRoom
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
		immediatelyRender: false,
		onMount: () => setEditorReady(true),
		onUpdate({ editor }) {
			if (editor.isEmpty) {
				editor.chain().focus().insertContent("<p></p>").run();
			}
		},
	});

	return (
		<div
			className={cn(
				"relative max-w-4xl mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all",
				"focus-within:border-border focus-within:shadow-lg focus-within:shadow-primary/5",
			)}
		>
			{!editorReady /* Precisely mimics editor sizings */ && (
				<div className="min-h-[3.68rem]">
					<p className="absolute left-4 top-[21px] text-muted-foreground/30 text-sm">
						{placeholder}
					</p>
				</div>
			)}

			<EditorContent editor={editor} />
			<div className="flex items-end justify-between p-4">
				<EditorTips singleParticipant={!isMultiDiscussionRoom} />
				<EditorSendButton />
			</div>
		</div>
	);
}
