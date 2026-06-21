"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

declare module "@tiptap/core" {
	interface Storage {
		sendShortcut: SendShortcutStorage;
	}
}

export interface SendShortcutStorage {
	send: () => void;
}

const sendShortcutPluginKey = new PluginKey("sendShortcut");
export const SendShortcutExtension = Extension.create<
	Record<string, never>,
	SendShortcutStorage
>({
	name: "sendShortcut",

	addStorage: () => ({ send: () => {} }),

	addKeyboardShortcuts() {
		const breakLine = () =>
			this.editor.commands.first(({ commands }) => [
				() => commands.newlineInCode(),
				() => commands.createParagraphNear(),
				() => commands.liftEmptyBlock(),
				() => commands.splitBlock(),
			]);

		return {
			"Mod-Enter": breakLine,
			"Shift-Enter": breakLine,
		};
	},

	addProseMirrorPlugins() {
		const editor = this.editor;
		return [
			new Plugin({
				key: sendShortcutPluginKey,
				props: {
					handleKeyDown: (_view, event) => {
						if (event.key !== "Enter" || event.isComposing) return false;

						const isInList = editor.isActive("listItem");

						if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
							event.preventDefault();
							editor.storage.sendShortcut.send();
							return true;
						}

						if (isInList) {
							event.preventDefault();
							editor.commands.splitListItem("listItem");
						}

						event.preventDefault();
						return editor.commands.first(({ commands }) => [
							() => commands.splitBlock(),
							() => commands.createParagraphNear(),
						]);
					},
				},
			}),
		];
	},
});
