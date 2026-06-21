interface EditorTipsProps {
	withMention?: boolean;
}

export function EditorTips({ withMention }: EditorTipsProps) {
	const moderatorTips = [
		"↵ send",
		"⌘↵ newline",
		...(withMention ? [] : ["@ mention"]),
		"**bold**",
		"_italic_",
		"`code`",
		"⌘K focus",
	];

	return (
		<span className="text-[10px] text-muted-foreground/30 font-mono">
			{moderatorTips.join(" · ")}
		</span>
	);
}
