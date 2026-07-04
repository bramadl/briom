import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { useRooms } from "../../hooks/use-rooms";

interface UseFormRoomToggler {
	/**
	 * @description
	 * If set to true, when the page (or modal) is being displayed, clicking (or
	 * triggering the hotkey) again will do nothing.
	 *
	 * The default behavior is false, meaning clicking the trigger again will
	 * bounce the user to the previous page (`router.back()`).
	 */
	preserve?: boolean;
}

export function useRoomFormToggler(options?: UseFormRoomToggler) {
	const { preserve = false } = options ?? { preserve: false };

	const { canOpenMoreRoom } = useRooms();

	const pathname = usePathname();
	const router = useRouter();

	const toggleForm = useCallback(() => {
		if (!canOpenMoreRoom) {
			if (pathname === "/rooms/form") return router.replace("/rooms");
			return;
		}

		if (pathname === "/rooms/form") {
			if (preserve) return;
			return router.back();
		}

		router.push("/rooms/form");
	}, [canOpenMoreRoom, pathname, preserve, router]);

	return {
		disabled: !canOpenMoreRoom,
		toggleForm,
	};
}
