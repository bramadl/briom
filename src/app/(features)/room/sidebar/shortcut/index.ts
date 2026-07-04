import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

/**
 * @description
 * Expand or shrink the sidebar collapsible panel.
 */
export const ROOM_SIDEBAR_SHORTCUT = {
	key: "Mod+/",
	keys: ["⌘", "/"],
} satisfies { key: RegisterableHotkey; keys: string[] };
