import type { MentionItem } from "./mention-types";

const SELECTED_CLASSES = ["bg-accent", "text-accent-foreground"];
const UNSELECTED_CLASSES = ["text-foreground/80", "hover:bg-accent/40"];

export class MentionPopupView {
	private readonly root: HTMLElement;
	private readonly list: HTMLElement;
	private buttons: HTMLButtonElement[] = [];

	constructor() {
		this.root = document.createElement("div");
		this.root.className =
			"z-50 max-h-72 w-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl";

		const header = document.createElement("div");
		header.className =
			"text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono px-2 py-1";
		header.textContent = "Mention a model";

		const divider = document.createElement("div");
		divider.className = "h-px bg-border/50 my-1";

		this.list = document.createElement("div");

		this.root.append(header, divider, this.list);
	}

	get element(): HTMLElement {
		return this.root;
	}

	/**
	 * Rebuilds the list DOM. Only call this when the item SET changes
	 * (onStart / onUpdate) -- never on arrow-key navigation.
	 */
	setItems(items: MentionItem[], command: (item: MentionItem) => void) {
		this.list.replaceChildren();
		this.buttons = [];

		if (items.length === 0) {
			const empty = document.createElement("div");
			empty.className =
				"px-2.5 py-3 text-xs text-muted-foreground/50 text-center italic";
			empty.textContent = "Nothing match your search";
			this.list.append(empty);
			return;
		}

		for (const item of items) {
			const button = document.createElement("button");
			button.type = "button";
			button.className =
				"mention-item w-full px-2.5 py-2 flex flex-col text-left text-sm transition-all rounded-lg";

			const label = document.createElement("span");
			label.className = "font-medium";
			label.textContent = item.label;

			const subtitle = document.createElement("span");
			subtitle.className =
				"font-mono text-[10px] text-muted-foreground/60 mt-0.5";
			subtitle.textContent = item.subtitle;

			button.append(label, subtitle);
			button.addEventListener("click", () => command(item));

			this.list.append(button);
			this.buttons.push(button);
		}
	}

	/**
	 * O(1) -- toggles classes on already-rendered buttons. No DOM rebuild,
	 * no re-querying, no re-attaching listeners.
	 */
	setSelectedIndex(index: number) {
		this.buttons.forEach((button, i) => {
			const isSelected = i === index;
			button.classList.toggle(SELECTED_CLASSES[0], isSelected);
			button.classList.toggle(SELECTED_CLASSES[1], isSelected);
			button.classList.toggle(UNSELECTED_CLASSES[0], !isSelected);
			button.classList.toggle(UNSELECTED_CLASSES[1], !isSelected);
		});
	}
}
