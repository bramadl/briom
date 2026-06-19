import { PlusIcon } from "lucide-react";

import { NewRoomTriggerButtonTooltip } from "./new-room-trigger-button-tooltip";

export const newRoomOption = (action: () => void, shortcuts: string[]) => {
	return {
		action,
		icon: PlusIcon,
		label: "New Room",
		tooltip: {
			children: <NewRoomTriggerButtonTooltip shortcuts={shortcuts} />,
			hidden: false,
		},
	};
};
