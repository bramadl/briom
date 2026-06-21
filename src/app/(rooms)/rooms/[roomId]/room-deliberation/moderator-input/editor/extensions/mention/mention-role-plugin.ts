import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const mentionRolePluginKey = new PluginKey("mentionRole");

export const MENTION_PRIMARY_CLASS = "bg-primary/15 text-primary";
export const MENTION_SECONDARY_CLASS =
	"bg-secondary/50 text-secondary-foreground/50";

function buildDecorations(doc: ProseMirrorNode): DecorationSet {
	const decorations: Decoration[] = [];
	let seenFirst = false;

	doc.descendants((node, pos) => {
		if (node.type.name !== "mention") return;

		decorations.push(
			Decoration.node(pos, pos + node.nodeSize, {
				class: seenFirst ? MENTION_SECONDARY_CLASS : MENTION_PRIMARY_CLASS,
			}),
		);
		seenFirst = true;
	});

	return DecorationSet.create(doc, decorations);
}

/**
 * "First mention = primary speaker" is derived here, not stored on the node.
 * Delete the first @mention and whatever used to be second becomes primary
 * automatically on the next transaction -- no attrs to keep in sync.
 */
export function createMentionRolePlugin() {
	return new Plugin({
		key: mentionRolePluginKey,
		state: {
			init: (_, { doc }) => buildDecorations(doc),
			apply: (tr, old) => (tr.docChanged ? buildDecorations(tr.doc) : old),
		},
		props: {
			decorations(state) {
				return mentionRolePluginKey.getState(state);
			},
		},
	});
}
