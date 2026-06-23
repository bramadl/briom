import { createContext } from "react";

interface RoomScrollerContextValue {
	isNearBottomRef: React.RefObject<boolean>;
	scrollRef: React.RefObject<HTMLDivElement | null>;
	scrollToBottom: (behavior?: ScrollBehavior) => void;
	showScrollButton: boolean;
}

export const RoomScrollerContext =
	createContext<RoomScrollerContextValue | null>(null);
