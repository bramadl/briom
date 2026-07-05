import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

/**
 * @description
 * Show or hide the room form modal.
 */
export const ROOM_FORM_SHORTCUT = {
	key: "Mod+.",
	keys: ["⌘", "."],
} satisfies { key: RegisterableHotkey; keys: string[] };
