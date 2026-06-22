import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";

import type { MentionItem } from "./mention-types";

export class MentionTypeaheadOption extends MenuOption {
	item: MentionItem;

	constructor(item: MentionItem) {
		super(item.id);
		this.item = item;
	}
}
