import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

export const ROOM_FORM_SHORTCUT = {
	key: "Mod+.",
	keys: ["⌘", "."],
} satisfies { key: RegisterableHotkey; keys: string[] };
