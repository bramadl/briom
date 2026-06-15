import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";

import type { MentionKind } from "./mention-node";

export class MentionOption extends MenuOption {
	kind: MentionKind;
	mentionKey: string;
	label: string;
	subtitle?: string;

	constructor(params: {
		kind: MentionKind;
		mentionKey: string;
		label: string;
		subtitle?: string;
	}) {
		super(`${params.kind}:${params.mentionKey}`);
		this.kind = params.kind;
		this.mentionKey = params.mentionKey;
		this.label = params.label;
		this.subtitle = params.subtitle;
	}
}
