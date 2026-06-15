"use client";

import type { ParticipantDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, type TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { $createMentionNode, type MentionKind } from "./mention-node";

const MAX_SUGGESTIONS = 8;

class MentionOption extends MenuOption {
  kind: MentionKind;
  mentionKey: string;
  label: string;
  subtitle?: string;

  constructor(params: {
    kind: MentionKind;
    mentionKey: string;
    label: string;
    subtitle?: string;
  }) {
    super(`${params.kind}:${params.mentionKey}`);
    this.kind = params.kind;
    this.mentionKey = params.mentionKey;
    this.label = params.label;
    this.subtitle = params.subtitle;
  }
}

interface MentionPluginProps {
  participants: ParticipantDTO[];
}

export function MentionPlugin({ participants }: MentionPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);

  const checkForTrigger = useBasicTypeaheadTriggerMatch("@", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const q = (query ?? "").toLowerCase();

    const participantOptions = participants
      .filter((p) => p.displayName.toLowerCase().includes(q))
      .map(
        (p) =>
          new MentionOption({
            kind: "participant",
            mentionKey: p.id,
            label: p.displayName,
            subtitle: `${p.provider}/${p.model}`,
          }),
      );

    return [...participantOptions].slice(
      0,
      MAX_SUGGESTIONS,
    );
  }, [query, participants]);

  const onSelectOption = useCallback(
    (
      option: MentionOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const text =
          option.kind === "participant"
            ? `@${option.label}`
            : `@${option.mentionKey}`;

        const mentionNode = $createMentionNode(
          option.kind,
          option.mentionKey,
          text,
        );

        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }

        const spaceNode = $createTextNode(" ");
        mentionNode.insertAfter(spaceNode);
        spaceNode.select();
      });
      closeMenu();
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      onQueryChange={setQuery}
      onSelectOption={onSelectOption}
      triggerFn={checkForTrigger}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current || options.length === 0) {
          return null;
        }

        return createPortal(
          <div className="absolute bottom-full left-0 z-50 mb-8 max-h-72 w-60 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-popover py-1 shadow-xl">
            {options.map((option, index) => (
              <button
                key={option.key}
                type="button"
                className={cn(
                  "w-full px-2.5 py-1.5 flex flex-col text-left text-sm transition-colors",
                  index === selectedIndex
                    ? index === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                    : "text-foreground/80 hover:bg-accent/50",
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectOptionAndCleanUp(option)}
              >
                <span
                  className={
                    option.kind === "participant"
                      ? "font-serif font-medium"
                      : "font-mono text-xs uppercase tracking-wide text-muted-foreground"
                  }
                >
                  {option.kind === "intent" ? `@${option.label}` : option.label}
                </span>
                {option.subtitle && (
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {option.subtitle}
                  </span>
                )}
              </button>
            ))}
          </div>,
          anchorElementRef.current,
        );
      }}
    />
  );
}