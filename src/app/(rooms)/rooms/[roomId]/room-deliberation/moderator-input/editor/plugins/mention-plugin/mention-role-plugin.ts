"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs } from "@lexical/utils";
import { HISTORY_MERGE_TAG } from "lexical";
import { useEffect } from "react";

import { $isMentionNode } from "./mention-node";

const ROLE_TAG = "mention-role";

export function MentionRolePlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerUpdateListener(({ tags }) => {
			if (tags.has(ROLE_TAG)) return;

			let needsChange = false;
			editor.getEditorState().read(() => {
				let isFirst = true;
				for (const { node } of $dfs()) {
					if (!$isMentionNode(node)) continue;
					if (node.getIsPrimary() !== isFirst) {
						needsChange = true;
						break;
					}
					isFirst = false;
				}
			});

			if (!needsChange) return;

			editor.update(
				() => {
					let isFirst = true;
					for (const { node } of $dfs()) {
						if (!$isMentionNode(node)) continue;
						if (node.getIsPrimary() !== isFirst) {
							node.getWritable().setIsPrimary(isFirst);
						}
						isFirst = false;
					}
				},
				{
					tag: [ROLE_TAG, HISTORY_MERGE_TAG],
					skipTransforms: true,
				},
			);
		});
	}, [editor]);

	return null;
}
