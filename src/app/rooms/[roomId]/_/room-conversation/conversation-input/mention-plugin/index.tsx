"use client";

import type { ParticipantDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, type TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { $createMentionNode } from "./mention-node";
import { MentionOption } from "./mention-option";

const MAX_SUGGESTIONS = 8;

interface MentionPluginProps {
	firstMentionedRef: React.RefObject<string | null>;
	menuOpenRef: React.RefObject<boolean>;
	participants: ParticipantDTO[];
}

export function MentionPlugin({
	participants,
	menuOpenRef,
	firstMentionedRef,
}: MentionPluginProps) {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);

	const checkForTrigger = useBasicTypeaheadTriggerMatch("@", {
		minLength: 0,
	});

	const options = useMemo(() => {
		const q = (query ?? "").toLowerCase();
		return participants
			.filter((p) => p.displayName.toLowerCase().includes(q))
			.map(
				(p) =>
					new MentionOption({
						kind: "participant",
						mentionKey: p.id,
						label: p.displayName,
						subtitle: `${p.provider}/${p.model}`,
					}),
			)
			.slice(0, MAX_SUGGESTIONS);
	}, [query, participants]);

	const onSelectOption = useCallback(
		(
			option: MentionOption,
			nodeToReplace: TextNode | null,
			closeMenu: () => void,
		) => {
			const isPrimary = !firstMentionedRef.current;
			if (isPrimary) {
				firstMentionedRef.current = option.mentionKey;
			}

			editor.update(() => {
				const text =
					option.kind === "participant"
						? `@${option.label}`
						: `@${option.mentionKey}`;

				const mentionNode = $createMentionNode(
					option.kind,
					option.mentionKey,
					text,
					isPrimary,
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
		[editor, firstMentionedRef],
	);

	return (
		<LexicalTypeaheadMenuPlugin<MentionOption>
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) => {
				if (!anchorElementRef.current || options.length === 0) {
					return null;
				}

				return createPortal(
					<div className="absolute bottom-full left-0 z-50 mb-2 max-h-72 w-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl">
						<div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono px-2 py-1">
							Mention a model
						</div>
						<div className="h-px bg-border/50 my-1" />
						{options.map((option, index) => (
							<button
								className={cn(
									"w-full px-2.5 py-2 flex flex-col text-left text-sm transition-all rounded-lg",
									index === selectedIndex
										? "bg-accent text-accent-foreground shadow-sm"
										: "text-foreground/80 hover:bg-accent/40",
								)}
								key={option.key}
								onClick={() => selectOptionAndCleanUp(option)}
								onMouseEnter={() => setHighlightedIndex(index)}
								type="button"
							>
								<span className="font-medium">{option.label}</span>
								{option.subtitle && (
									<span className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
										{option.subtitle}
									</span>
								)}
							</button>
						))}
					</div>,
					anchorElementRef.current,
				);
			}}
			onClose={() => {
				menuOpenRef.current = false;
			}}
			onOpen={() => {
				menuOpenRef.current = true;
			}}
			onQueryChange={setQuery}
			onSelectOption={onSelectOption}
			options={options}
			triggerFn={checkForTrigger}
		/>
	);
}
