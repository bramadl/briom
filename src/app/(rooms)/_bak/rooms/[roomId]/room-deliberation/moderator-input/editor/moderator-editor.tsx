"use client";

import { cn } from "@briom/libs/utils";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { LexicalEditor } from "lexical";

import { moderatorEditorNodes } from "./editor-nodes";
import { moderatorEditorTheme } from "./editor-theme";
import { $isEditorEmpty, IMPORT_TRANSFORMERS } from "./helpers";
import {
	CodeHighlightPlugin,
	type MentionItem,
	MentionPlugin,
	MentionRolePlugin,
	SendShortcutPlugin,
} from "./plugins";

// No `prose` here — Tailwind Typography's dark:prose-invert sets
// --tw-prose-code to white, overriding all syntax highlight colours.
// The Lexical theme owns every element style directly instead.
const editorContentClass = cn(
	"min-h-24 lg:min-h-16 max-h-[36rem] w-full bg-transparent",
	"px-4 pt-3 pb-1 text-sm leading-relaxed",
	"overflow-y-auto focus:outline-none",
);

function onError(error: Error) {
	console.error("[ModeratorEditor]", error);
}

interface ModeratorEditorProps {
	editorRef: React.RefObject<LexicalEditor | null>;
	mentionList?: MentionItem[];
	onEmptyChange: (isEmpty: boolean) => void;
	onSend: () => void;
	placeholder: string;
}

export function ModeratorEditor({
	editorRef,
	mentionList,
	onEmptyChange,
	onSend,
	placeholder,
}: ModeratorEditorProps) {
	return (
		<LexicalComposer
			initialConfig={{
				namespace: "ModeratorInput",
				nodes: moderatorEditorNodes,
				onError,
				theme: moderatorEditorTheme,
			}}
		>
			<RichTextPlugin
				contentEditable={
					<ContentEditable
						aria-placeholder={placeholder}
						className={editorContentClass}
						placeholder={
							<div className="pointer-events-none absolute inset-0 px-4 pt-3 text-sm text-muted-foreground/30 select-none leading-relaxed">
								{placeholder}
							</div>
						}
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HistoryPlugin />
			<ListPlugin />
			<LinkPlugin />
			<MarkdownShortcutPlugin transformers={IMPORT_TRANSFORMERS} />
			<CodeHighlightPlugin />
			{mentionList ? (
				<>
					<MentionPlugin mentionList={mentionList} />
					<MentionRolePlugin />
				</>
			) : null}
			<SendShortcutPlugin onSend={onSend} />
			<OnChangePlugin
				onChange={(editorState) => {
					editorState.read(() => onEmptyChange($isEditorEmpty()));
				}}
			/>
			<EditorRefPlugin editorRef={editorRef} />
		</LexicalComposer>
	);
}
