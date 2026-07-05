import type { RoomStatus } from "@briom/core/domain";

export const ROOM_THEME = {
	status: {
		concluded: {
			class: "bg-terracotta/10 text-terracotta",
			label: "Concluded",
		},
		deliberating: {
			class: "bg-dusty-blue/10 text-dusty-blue",
			label: "Deliberating",
		},
		forming: {
			class: "bg-sage/10 text-sage",
			label: "Forming",
		},
	} satisfies Record<RoomStatus, { class: string; label: string }>,
};
