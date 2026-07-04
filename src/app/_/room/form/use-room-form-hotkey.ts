import { useHotkey } from "@tanstack/react-hotkeys";

import { ROOM_SHORTCUT } from "../settings/shortcut";
import { useRoomFormToggler } from "./use-room-form-toggler";

export function useRoomFormHotkey() {
	const { disabled, toggleForm } = useRoomFormToggler();
	useHotkey(ROOM_SHORTCUT.toggleForm.key, toggleForm, {
		conflictBehavior: "replace",
		enabled: !disabled,
	});
}
