import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app/bak";
import { useCallback, useMemo, useRef } from "react";

import type { PARTICIPANT_THEMES } from "../../participant/config/theme";

export type ParticipantWithTheme = RoomDeliberationParticipantDTO & {
	theme: (typeof PARTICIPANT_THEMES)[number];
};

interface UseTimelineProps {
	turns: RoomDeliberationTurnDTO[];
}

export function useTimeline({ turns }: UseTimelineProps) {
	const maxContentLength = useMemo(() => {
		if (turns.length === 0) return 1;
		return Math.max(...turns.map((t) => t.content?.length || 0), 1);
	}, [turns]);

	const calculateLogarithmicWidth = useCallback(
		(content: string): string => {
			const length = content?.length || 0;
			if (length <= 0) return "1%";

			const ratio = length / maxContentLength;
			const smoothed = ratio ** 0.6;
			const minWidth = 8;
			const maxWidth = 100;

			return `${(minWidth + smoothed * (maxWidth - minWidth)).toFixed(1)}%`;
		},
		[maxContentLength],
	);

	const activeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleScrollToTurn = useCallback((turnId: string) => {
		const element = document.getElementById(turnId);
		if (!element) return;

		element.scrollIntoView({ behavior: "auto", block: "center" });

		const flashClass = "animate-turn-flash";

		if (activeTimeoutRef.current) {
			clearTimeout(activeTimeoutRef.current);
		}

		const triggerWobble = () => {
			element.classList.remove(flashClass);

			void element.offsetWidth;
			element.classList.add(flashClass);

			activeTimeoutRef.current = setTimeout(() => {
				element.classList.remove(flashClass);
				activeTimeoutRef.current = null;
			}, 1200);
		};

		activeTimeoutRef.current = setTimeout(() => {
			triggerWobble();
		}, 50);
	}, []);

	return {
		calculateLogarithmicWidth,
		handleScrollToTurn,
	};
}
