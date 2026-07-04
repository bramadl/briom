import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

type ShortcutKey = "toggleForm" | "toggleSidebar";

export const ROOM_SHORTCUT = {
	/**
	 * @description
	 * Show or hide the room form modal.
	 */
	toggleForm: {
		key: "Mod+.",
		keys: ["⌘", "."],
	},

	/**
	 * @description
	 * Expand or shrink the sidebar collapsible panel.
	 */
	toggleSidebar: {
		key: "Mod+/",
		keys: ["⌘", "/"],
	},
} satisfies Record<ShortcutKey, { key: RegisterableHotkey; keys: string[] }>;
