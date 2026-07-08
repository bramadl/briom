import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

export const ROOM_SIDEBAR_SHORTCUT = {
	key: "Mod+/",
	keys: ["⌘", "/"],
} satisfies { key: RegisterableHotkey; keys: string[] };
