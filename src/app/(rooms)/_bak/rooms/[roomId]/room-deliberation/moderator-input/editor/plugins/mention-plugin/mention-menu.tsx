"use client";

import { cn } from "@briom/libs/utils";

import type { MentionTypeaheadOption } from "./mention-typeahead-option";

interface MentionMenuProps {
	onHighlight: (index: number) => void;
	onSelect: (option: MentionTypeaheadOption) => void;
	options: MentionTypeaheadOption[];
	selectedIndex: number | null;
}

export function MentionMenu({
	onHighlight,
	onSelect,
	options,
	selectedIndex,
}: MentionMenuProps) {
	return (
		<div className="z-100 max-h-72 w-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl">
			<div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono px-2 py-1">
				Mention a model
			</div>
			<div className="h-px bg-border/50 my-1" />

			{options.length === 0 ? (
				<div className="px-2.5 py-3 text-xs text-muted-foreground/50 text-center italic">
					Nothing match your search
				</div>
			) : (
				options.map((option, index) => (
					<button
						className={cn(
							"mention-item w-full px-2.5 py-2 flex flex-col text-left text-sm transition-all rounded-lg",
							index === selectedIndex
								? "bg-accent text-accent-foreground"
								: "text-foreground/80 hover:bg-accent/40",
						)}
						key={option.key}
						onClick={() => onSelect(option)}
						onMouseEnter={() => onHighlight(index)}
						ref={option.setRefElement}
						type="button"
					>
						<span className="font-medium">{option.item.label}</span>
						<span className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
							{option.item.subtitle}
						</span>
					</button>
				))
			)}
		</div>
	);
}
