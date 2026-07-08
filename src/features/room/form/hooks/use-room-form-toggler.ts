import { useRooms } from "@briom/room/hooks/use-rooms";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseFormRoomToggler {
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
