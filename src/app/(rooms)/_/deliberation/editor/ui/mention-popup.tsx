"use client";

import { cn } from "@briom/libs/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef } from "react";
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

	const filteredRef = useRef(filtered);
	filteredRef.current = filtered;

	const selectedIndexRef = useRef(selectedIndex);
	selectedIndexRef.current = selectedIndex;

	const storeRef = useRef(store);
	storeRef.current = store;

	const insertRef = useRef(insert);
	insertRef.current = insert;

	useEffect(() => {
		if (!visible) return;

		const handler = (e: KeyboardEvent) => {
			const activeElement = document.activeElement;
			const editorRoot = editor.getRootElement();
			const isEditorFocused = editorRoot?.contains(activeElement) ?? false;

			if (!isEditorFocused && activeElement !== editorRoot) {
				storeRef.current.visible.value = false;
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				const items = filteredRef.current;
				const nextIndex = (selectedIndexRef.current + 1) % items.length;
				storeRef.current.selectedIndex.value = nextIndex;
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				const items = filteredRef.current;
				const prevIndex =
					(selectedIndexRef.current - 1 + items.length) % items.length;
				storeRef.current.selectedIndex.value = prevIndex;
			} else if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				const item = filteredRef.current[selectedIndexRef.current];
				if (item) insertRef.current(item);
			} else if (e.key === "Escape") {
				storeRef.current.visible.value = false;
			}
		};

		window.addEventListener("keydown", handler, true);
		return () => window.removeEventListener("keydown", handler, true);
	}, [visible, editor]);

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
