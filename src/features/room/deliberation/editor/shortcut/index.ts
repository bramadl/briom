import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

/**
 * @description
 * Expand or shrink the sidebar collapsible panel.
 */
export const ROOM_EDITOR_SHORTCUT = {
	key: "Mod+K",
	keys: ["⌘", "K"],
} satisfies { key: RegisterableHotkey; keys: string[] };
