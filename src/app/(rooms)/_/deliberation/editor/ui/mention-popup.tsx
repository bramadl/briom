"use client";

import { cn } from "@briom/libs/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import { INSERT_MENTION_COMMAND } from "../extensions/mention.extension";
import { useSignalValue } from "../libs/signal";
import { getMentionStore } from "../store/mention.store";

export interface MentionItem {
	id: string;
	label: string;
	subtitle: string;
}

interface MentionPopupProps {
	entities: MentionItem[];
}

export function MentionPopup({ entities }: MentionPopupProps) {
	const [editor] = useLexicalComposerContext();
	const store = getMentionStore(editor);

	const query = useSignalValue(store.query);
	const visible = useSignalValue(store.visible);
	const rect = useSignalValue(store.rect);
	const above = useSignalValue(store.above);
	const selectedIndex = useSignalValue(store.selectedIndex);

	const filtered = entities.filter((e) =>
		e.label.toLowerCase().includes(query.toLowerCase()),
	);

	const insert = useCallback(
		(item: MentionItem) => {
			editor.dispatchCommand(INSERT_MENTION_COMMAND, {
				id: item.id,
				label: item.label,
			});
		},
		[editor],
	);

	useEffect(() => {
		if (!visible) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				store.selectedIndex.value = (selectedIndex + 1) % filtered.length;
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				store.selectedIndex.value =
					(selectedIndex - 1 + filtered.length) % filtered.length;
			} else if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				const item = filtered[selectedIndex];
				if (item) insert(item);
			} else if (e.key === "Escape") {
				store.visible.value = false;
			}
		};
		window.addEventListener("keydown", handler, true);
		return () => window.removeEventListener("keydown", handler, true);
	}, [visible, filtered, selectedIndex, store, insert]);

	if (!visible || filtered.length === 0) return null;

	const style: React.CSSProperties = {
		position: "fixed",
		left: rect?.left ?? 0,
		zIndex: 9999,
		...(above
			? { bottom: window.innerHeight - (rect?.top ?? 0) + 8 }
			: { top: (rect?.bottom ?? 0) + 8 }),
	};

	return createPortal(
		<div
			className="w-64 rounded-lg border border-border bg-popover shadow-xl p-1 overflow-hidden"
			style={style}
		>
			<div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono px-2 py-1">
				Mention a model
			</div>
			<div className="h-px bg-border/50 my-1" />
			<div className="max-h-[200px] overflow-y-auto">
				{filtered.map((item, i) => (
					<button
						className={cn(
							"w-full px-2.5 py-2 flex flex-col text-left text-sm transition-all rounded-lg",
							i === selectedIndex
								? "bg-accent text-accent-foreground"
								: "text-foreground/80 hover:bg-accent/40",
						)}
						key={item.id}
						onClick={() => insert(item)}
						onMouseEnter={() => {
							store.selectedIndex.value = i;
						}}
						type="button"
					>
						<span className="font-medium">{item.label}</span>
						<span className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
							{item.subtitle}
						</span>
					</button>
				))}
			</div>
		</div>,
		document.body,
	);
}
