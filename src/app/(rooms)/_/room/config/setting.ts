import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

type ShortcutItem = "create" | "sidebar" | "input";
type Shortcut = Record<
	ShortcutItem,
	{ key: RegisterableHotkey; tokens: string[] }
>;

export const ROOM_SETTING = {
	MAXIMUM_PARTICIPANT: 4,
	SHORTCUTS: {
		create: {
			key: "Mod+.",
			tokens: ["⌘", "."],
		},
		sidebar: {
			key: "Mod+/",
			tokens: ["⌘", "/"],
		},
		input: {
			key: "Mod+K",
			tokens: ["⌘", "K"],
		},
	} satisfies Shortcut,
} as const;
