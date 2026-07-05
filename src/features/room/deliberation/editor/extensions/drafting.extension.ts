import { defineExtension } from "lexical";

import { isEmptyEditorJSON } from "../helpers/is-empty-json";

interface DraftingConfig {
	draftKey: string;
	onClearRef?: { current: (() => void) | null };
}

const DRAFT_PREFIX = "briom:draft:";

export function createDraftingExtension({
	draftKey,
	onClearRef,
}: DraftingConfig) {
	const storageKey = `${DRAFT_PREFIX}${draftKey}`;

	return defineExtension({
		name: "@briom/lexical/Drafting",
		register(editor) {
			let isRestoring = false;

			const raw = localStorage.getItem(storageKey);
			if (raw) {
				try {
					const json = JSON.parse(raw);
					if (isEmptyEditorJSON(json)) {
						localStorage.removeItem(storageKey);
					} else {
						const state = editor.parseEditorState(json);
						isRestoring = true;
						editor.setEditorState(state);

						requestAnimationFrame(() => {
							isRestoring = false;
						});
					}
				} catch (err) {
					console.error("[Drafting] Failed to restore draft", err);
					localStorage.removeItem(storageKey);
				}
			}

			const unsubscribe = editor.registerUpdateListener(
				({ editorState, dirtyElements, dirtyLeaves }) => {
					if (isRestoring) return;
					if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

					const json = editorState.toJSON();
					if (isEmptyEditorJSON(json)) {
						localStorage.removeItem(storageKey);
						return;
					}

					localStorage.setItem(storageKey, JSON.stringify(json));
				},
			);

			const clear = () => localStorage.removeItem(storageKey);
			if (onClearRef) onClearRef.current = clear;

			return () => {
				unsubscribe();
				if (onClearRef) onClearRef.current = null;
			};
		},
	});
}
