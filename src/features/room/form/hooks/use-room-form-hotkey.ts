import { useHotkey } from "@tanstack/react-hotkeys";

import { ROOM_FORM_SHORTCUT } from "../shortcut";
import { useRoomFormToggler } from "./use-room-form-toggler";

export function useRoomFormHotkey() {
	const { disabled, toggleForm } = useRoomFormToggler();
	useHotkey(ROOM_FORM_SHORTCUT.key, toggleForm, {
		conflictBehavior: "replace",
		enabled: !disabled,
	});
}
