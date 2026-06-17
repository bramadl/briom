import type { ParticipantDTO } from "@briom/core/application";
import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";

interface MentionItem {
	id: string;
	label: string;
	subtitle: string;
}

export function buildMentionExtension(
	participants: ParticipantDTO[],
	menuOpenRef: React.RefObject<boolean | null>,
) {
	return Mention.configure({
		HTMLAttributes: {
			class:
				"mention text-xs rounded-md bg-primary/15 px-1 py-0.5 font-medium text-primary select-none inline-flex items-center gap-0.5",
		},
		renderText({ node }) {
			return `@${node.attrs.label as string}`;
		},
		renderHTML({ node }) {
			return [
				"span",
				{
					class:
						"mention text-xs rounded-md bg-primary/15 px-1 py-0.5 font-medium text-primary select-none inline-flex items-center gap-0.5",
					"data-mention-id": node.attrs.id,
				},
				`@${node.attrs.label as string}`,
			];
		},
		suggestion: {
			items: ({ query }): MentionItem[] =>
				participants
					.filter((p) =>
						p.displayName.toLowerCase().includes(query.toLowerCase()),
					)
					.slice(0, 8)
					.map((p) => ({
						id: p.id,
						label: p.displayName,
						subtitle: `${p.provider}/${p.model}`,
					})),

			render: () => {
				let el: HTMLElement | null = null;
				let popup: Instance | null = null;
				let selectedIndex = 0;
				let currentItems: MentionItem[] = [];
				let currentCommand: ((item: MentionItem) => void) | null = null;

				return {
					onStart(props) {
						menuOpenRef.current = true;
						selectedIndex = 0;
						currentItems = props.items;
						currentCommand = props.command;

						el = document.createElement("div");
						el.className =
							"z-50 max-h-72 w-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl";

						renderItems(el, props.items, props.command, selectedIndex);

						const instances = tippy(document.body, {
							getReferenceClientRect: props.clientRect as () => DOMRect,
							appendTo: () => document.body,
							content: el,
							showOnCreate: true,
							interactive: true,
							trigger: "manual",
							placement: "top-start",
							hideOnClick: false,
						});

						popup = Array.isArray(instances) ? instances[0] : instances;
					},

					onUpdate(props) {
						selectedIndex = 0;
						currentItems = props.items;
						currentCommand = props.command;

						if (!el || !popup) return;

						renderItems(el, props.items, props.command, selectedIndex);
						popup.setProps({
							getReferenceClientRect: props.clientRect as () => DOMRect,
						});
					},

					onKeyDown({ event }) {
						if (!popup || !el || !currentCommand) return false;
						const item = currentItems[selectedIndex];

						switch (event.key) {
							case "Escape":
								popup.hide();
								return true;

							case "ArrowUp":
								event.preventDefault();
								selectedIndex = Math.max(0, selectedIndex - 1);
								renderItems(el, currentItems, currentCommand, selectedIndex);
								return true;

							case "ArrowDown":
								event.preventDefault();
								selectedIndex = Math.min(
									currentItems.length - 1,
									selectedIndex + 1,
								);
								renderItems(el, currentItems, currentCommand, selectedIndex);
								return true;

							case "Enter":
							case "Tab":
								event.preventDefault();
								if (item && currentCommand) {
									currentCommand(item);
									try {
										popup?.hide();
									} catch {}
								}
								return true;

							default:
								return false;
						}
					},

					onExit() {
						menuOpenRef.current = false;
						try {
							popup?.destroy();
						} catch {}
						el = null;
						popup = null;
					},
				};
			},
		} as Partial<SuggestionOptions<MentionItem>>,
	});
}

function renderItems(
	el: HTMLElement,
	items: MentionItem[],
	command: (item: MentionItem) => void,
	selectedIndex: number,
) {
	el.innerHTML = `
    <div class="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono px-2 py-1">
      Mention a model
    </div>
    <div class="h-px bg-border/50 my-1"></div>
    ${items
			.map(
				(item, i) => `
      <button
        type="button"
        class="mention-item w-full px-2.5 py-2 flex flex-col text-left text-sm transition-all rounded-lg ${
					i === selectedIndex
						? "bg-accent text-accent-foreground"
						: "text-foreground/80 hover:bg-accent/40"
				}"
        data-index="${i}"
      >
        <span class="font-medium">${escapeHtml(item.label)}</span>
        <span class="font-mono text-[10px] text-muted-foreground/60 mt-0.5">${escapeHtml(item.subtitle)}</span>
      </button>`,
			)
			.join("")}`;

	el.querySelectorAll<HTMLButtonElement>(".mention-item").forEach((btn, i) => {
		btn.addEventListener("click", () => {
			const item = items[i];
			if (item) command(item);
		});
	});
}

function escapeHtml(text: string): string {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}
