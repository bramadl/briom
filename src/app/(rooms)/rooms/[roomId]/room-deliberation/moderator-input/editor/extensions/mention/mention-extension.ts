"use client";

import { cn } from "@briom/libs/utils";
import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions } from "@tiptap/suggestion";

import { MentionPopupController } from "./mention-popup-controller";
import { createMentionRolePlugin } from "./mention-role-plugin";
import type { MentionItem } from "./mention-types";

const mentionBaseClass = cn(
	"mention inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md",
	"font-medium text-xs select-none",
);

export function buildMentionExtensions(mentionList: MentionItem[]) {
	return Mention.extend({
		addProseMirrorPlugins() {
			return [...(this.parent?.() ?? []), createMentionRolePlugin()];
		},
	}).configure({
		HTMLAttributes: { class: mentionBaseClass },
		renderText: ({ node }) => `@${node.attrs.label as string}`,
		renderHTML({ node }) {
			return [
				"span",
				{ class: mentionBaseClass, "data-mention-id": node.attrs.id },
				`@${node.attrs.label as string}`,
			];
		},
		suggestion: {
			items: ({ query }): MentionItem[] => {
				return mentionList
					.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
					.slice(0, 8);
			},
			render: () => new MentionPopupController(),
		} as Partial<SuggestionOptions<MentionItem>>,
	});
}
