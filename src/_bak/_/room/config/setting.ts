import {
	ATTACHMENT_SIZE_LIMIT,
	RoomAttachmentPolicy,
} from "@briom/core/domain";
import { SUPABASE_STORAGE } from "@briom/libs/providers/supabase/config/storage";
import type { RegisterableHotkey } from "@tanstack/react-hotkeys";

type ShortcutItem = "create" | "sidebar" | "input";
type Shortcut = Record<
	ShortcutItem,
	{ key: RegisterableHotkey; tokens: string[] }
>;

export const ROOM_SETTING = {
	MAXIMUM_PARTICIPANT: 4,
	MAXIMUM_ROOMS: 5,
	MAX_ATTACHMENTS: RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM,
	ATTACHMENT: { maxSizes: ATTACHMENT_SIZE_LIMIT },
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
	STORAGE: { bucket: SUPABASE_STORAGE.BUCKET_NAME },
} as const;
