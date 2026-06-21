import type {
	SuggestionKeyDownProps,
	SuggestionProps,
} from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";

import { MentionPopupView } from "./mention-popup-view";
import type { MentionItem } from "./mention-types";

export class MentionPopupController {
	private readonly view = new MentionPopupView();
	private popup: Instance | null = null;
	private selectedIndex = 0;
	private items: MentionItem[] = [];
	private command: (item: MentionItem) => void = () => {};

	onStart(props: SuggestionProps<MentionItem>) {
		this.syncItems(props);

		const instances = tippy(document.body, {
			getReferenceClientRect: props.clientRect as () => DOMRect,
			appendTo: () => document.body,
			content: this.view.element,
			showOnCreate: true,
			interactive: true,
			trigger: "manual",
			placement: "top-start",
			hideOnClick: false,
		});

		this.popup = Array.isArray(instances) ? (instances[0] ?? null) : instances;
	}

	onUpdate(props: SuggestionProps<MentionItem>) {
		this.syncItems(props);
		this.popup?.setProps({
			getReferenceClientRect: props.clientRect as () => DOMRect,
		});
	}

	onKeyDown({ event }: SuggestionKeyDownProps): boolean {
		if (!this.popup) return false;

		switch (event.key) {
			case "Escape":
				this.popup.hide();
				return true;

			case "ArrowUp":
				event.preventDefault();
				this.selectedIndex = Math.max(0, this.selectedIndex - 1);
				this.view.setSelectedIndex(this.selectedIndex);
				return true;

			case "ArrowDown":
				event.preventDefault();
				this.selectedIndex = Math.min(
					this.items.length - 1,
					this.selectedIndex + 1,
				);
				this.view.setSelectedIndex(this.selectedIndex);
				return true;

			case "Enter":
			case "Tab": {
				event.preventDefault();
				const item = this.items[this.selectedIndex];
				if (item) {
					this.command(item);
					try {
						this.popup?.hide();
					} catch {}
				}
				return true;
			}

			default:
				return false;
		}
	}

	onExit() {
		try {
			this.popup?.destroy();
		} catch {}
		this.popup = null;
	}

	private syncItems(props: SuggestionProps<MentionItem>) {
		this.selectedIndex = 0;
		this.items = props.items;
		this.command = props.command;
		this.view.setItems(props.items, props.command);
		this.view.setSelectedIndex(this.selectedIndex);
	}
}
