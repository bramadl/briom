"use client";

import type { ParticipantDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { Button } from "@briom/ui/button";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
  $createParagraphNode,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  type EditorState,
  EditorThemeClasses,
  KEY_ENTER_COMMAND,
} from "lexical";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MentionNode } from "./mention-node";
import { MentionPlugin } from "./mention-plugin";

interface ConversationInputProps {
  disabled?: boolean;
  isStreaming?: boolean;
  namespace?: string;
  onSend: (content: string) => Promise<void>;
  participants: ParticipantDTO[];
  placeholder?: string;
  editorTheme?: EditorThemeClasses;
}

export function ConversationInput({
  disabled,
  editorTheme = {
    paragraph: "m-0",
  },
  isStreaming,
  namespace = "ConversationInput",
  onSend,
  participants,
  placeholder = "Bring something into the discussion... (use @ to mention a participant or action)",
}: ConversationInputProps) {
  const initialConfig = useMemo(
    () => ({
      namespace,
      theme: editorTheme,
      nodes: [MentionNode],
      onError: (error: Error) => {
        throw error;
      },
    }),
    [],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ConversationInputBody
        onSend={onSend}
        disabled={disabled}
        isStreaming={isStreaming}
        participants={participants}
        placeholder={placeholder}
      />
    </LexicalComposer>
  );
}

function ConversationInputBody({
  onSend,
  disabled,
  isStreaming,
  participants,
  placeholder,
}: Required<Pick<ConversationInputProps, "placeholder">> &
  Omit<ConversationInputProps, "placeholder">) {
  const [editor] = useLexicalComposerContext();

  const [isEmpty, setIsEmpty] = useState(true);
  const [sending, setSending] = useState(false);

  const isDisabled = Boolean(disabled || isStreaming || sending);

  const handleSend = useCallback(async () => {
    if (isEmpty || isDisabled) return;

    const content = editor
      .getEditorState()
      .read(() => $getRoot().getTextContent().trim());

    if (!content) return;

    setSending(true);
    try {
      await onSend(content);
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.select();
      });
    } finally {
      setSending(false);
    }
  }, [editor, isEmpty, isDisabled, onSend]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event?.shiftKey) {
          return false;
        }
        event?.preventDefault();
        void handleSend();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, handleSend]);

  useEffect(() => {
    editor.setEditable(!isDisabled);
  }, [editor, isDisabled]);

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      setIsEmpty($getRoot().getTextContent().trim().length === 0);
    });
  }, []);

  return (
    <div
      className={cn(
        "relative max-w-3xl mx-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-colors",
        "focus-within:border-border",
      )}
    >
      <div className="relative">
        <PlainTextPlugin
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
          placeholder={
            <div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground/40">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>

      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
      <MentionPlugin participants={participants} />

      <div className="flex items-center justify-between px-3 pb-2.5">
        <span className="text-[10px] text-muted-foreground/30 font-mono">
          ↵ send · shift+↵ newline · @ mention
        </span>
        <Button
          className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isEmpty || isDisabled}
          onClick={handleSend}
          size="icon"
        >
          {isStreaming ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowUp />
          )}
        </Button>
      </div>
    </div>
  );
}