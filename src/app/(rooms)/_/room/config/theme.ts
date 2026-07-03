import type { RoomDTO } from "@briom/app/bak";

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
		paused: {
			class: "bg-muted-lavender/10 text-muted-lavender",
			label: "Paused",
		},
	} satisfies Record<RoomDTO["status"], { class: string; label: string }>,
};
