import type { LexicalEditor } from "lexical";

import { Signal } from "../libs/signal";

export class MentionStore {
	query = new Signal("");
	visible = new Signal(false);
	rect = new Signal<DOMRect | null>(null);
	above = new Signal(false);
	selectedIndex = new Signal(0);
}

const stores = new WeakMap<LexicalEditor, MentionStore>();

export function getMentionStore(editor: LexicalEditor): MentionStore {
	if (!stores.has(editor)) {
		stores.set(editor, new MentionStore());
	}
	return stores.get(editor) as MentionStore;
}
