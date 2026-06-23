import { defineExtension } from "lexical";

export const AutoFocusExtension = defineExtension({
	name: "@briom/lexical/AutoFocus",
	register(editor) {
		return editor.registerRootListener((rootElement) => {
			if (rootElement !== null) {
				editor.focus();
			}
		});
	},
});
