interface ModeratorTipsProps {
	canMention?: boolean;
}

export function ModeratorTips({ canMention }: ModeratorTipsProps) {
	const tips = [
		"↵ send",
		"⇧↵ newline",
		...(canMention ? ["@ mention"] : []),
		"**bold**",
		"_italic_",
		"`code`",
		"⌘K focus",
	];

	return (
		<span className="text-[10px] text-muted-foreground/30 font-mono">
			{tips.join(" · ")}
		</span>
	);
}
