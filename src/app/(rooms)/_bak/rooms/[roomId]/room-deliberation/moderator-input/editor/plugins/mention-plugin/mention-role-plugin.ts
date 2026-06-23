"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs } from "@lexical/utils";
import { useEffect } from "react";

import { $isMentionNode, MentionNode } from "./mention-node";

/**
 * Derives "first mention = primary" and stores it on each MentionNode as
 * `isPrimary`. The node's own `createDOM`/`updateDOM` then applies the
 * correct CSS classes through Lexical's reconciler — so we never touch
 * Lexical-owned DOM elements from outside, which was the root cause of the
 * infinite update loop in the previous version.
 *
 * Loop-safety: `registerNodeTransform` runs *inside* the current update
 * cycle. Lexical re-runs transforms only while nodes remain dirty. After
 * the first pass all mentions have the correct `isPrimary` value, so no
 * node becomes dirty again → transforms stop. No `registerUpdateListener`
 * + external `editor.update()` dance needed.
 */
export function MentionRolePlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerNodeTransform(MentionNode, () => {
			// Walk the whole doc and fix every mention's isPrimary.
			// Any mention that was already correct is skipped (no write).
			let isFirst = true;
			for (const { node } of $dfs()) {
				if (!$isMentionNode(node)) continue;
				if (node.getIsPrimary() !== isFirst) {
					node.getWritable().setIsPrimary(isFirst);
				}
				isFirst = false;
			}
		});
	}, [editor]);

	return null;
}
