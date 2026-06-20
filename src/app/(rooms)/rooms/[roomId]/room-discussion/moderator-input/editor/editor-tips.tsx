interface EditorTipsProps {
	singleParticipant?: boolean;
}

export function EditorTips({ singleParticipant }: EditorTipsProps) {
	const moderatorTips = [
		"⌘↵ send",
		"↵ newline",
		...(singleParticipant ? [] : ["@ mention"]),
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
