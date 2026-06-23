"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	type MenuTextMatch,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { COMMAND_PRIORITY_HIGH, type TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { MentionMenu } from "./mention-menu";
import { $createMentionNode } from "./mention-node";
import { MentionTypeaheadOption } from "./mention-typeahead-option";
import type { MentionItem } from "./mention-types";

const MAX_RESULTS = 8;

interface MentionPluginProps {
	mentionList: MentionItem[];
}

export function MentionPlugin({ mentionList }: MentionPluginProps) {
	const [editor] = useLexicalComposerContext();
	const [queryString, setQueryString] = useState<string | null>(null);

	const checkForMentionMatch = useBasicTypeaheadTriggerMatch("@", {
		minLength: 0,
	});

	const triggerFn = useCallback(
		(text: string): MenuTextMatch | null => checkForMentionMatch(text, editor),
		[checkForMentionMatch, editor],
	);

	const options = useMemo(() => {
		if (queryString === null) return [];
		const query = queryString.toLowerCase();

		return mentionList
			.filter((item) => item.label.toLowerCase().includes(query))
			.slice(0, MAX_RESULTS)
			.map((item) => new MentionTypeaheadOption(item));
	}, [mentionList, queryString]);

	const onSelectOption = useCallback(
		(
			option: MentionTypeaheadOption,
			nodeToReplace: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				const mentionNode = $createMentionNode(
					option.item.id,
					option.item.label,
				);

				if (nodeToReplace) nodeToReplace.replace(mentionNode);
				mentionNode.selectNext();
			});
			closeMenu();
		},
		[editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
			commandPriority={COMMAND_PRIORITY_HIGH}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) =>
				anchorElementRef.current
					? createPortal(
							<MentionMenu
								onHighlight={setHighlightedIndex}
								onSelect={selectOptionAndCleanUp}
								options={options}
								selectedIndex={selectedIndex}
							/>,
							anchorElementRef.current,
						)
					: null
			}
			onQueryChange={setQueryString}
			onSelectOption={onSelectOption}
			options={options}
			triggerFn={triggerFn}
		/>
	);
}
