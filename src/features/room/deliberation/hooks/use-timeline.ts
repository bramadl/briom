import type { RoomTurnDTO } from "@briom/core/app";
import { useCallback, useMemo, useRef } from "react";

interface UseTimelineProps {
	turns: RoomTurnDTO[];
}

export function useTimeline({ turns }: UseTimelineProps) {
	const maxContentLength = useMemo(() => {
		if (turns.length === 0) return 1;
		return Math.max(...turns.map((t) => t.content?.length ?? 0), 1);
	}, [turns]);

	const calculateLogarithmicWidth = useCallback(
		(content: string | null | undefined): string => {
			const length = content?.length ?? 0;
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

	const scrollToTurn = useCallback((turnId: string) => {
		const element = document.getElementById(turnId);
		if (!element) return;

		element.scrollIntoView({ behavior: "auto", block: "center" });
		if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);

		const flashClass = "animate-turn-flash";
		const triggerWobble = () => {
			element.classList.remove(flashClass);

			void element.offsetWidth;
			element.classList.add(flashClass);

			activeTimeoutRef.current = setTimeout(() => {
				element.classList.remove(flashClass);
				activeTimeoutRef.current = null;
			}, 1200);
		};

		activeTimeoutRef.current = setTimeout(triggerWobble, 50);
	}, []);

	return {
		calculateLogarithmicWidth,
		scrollToTurn,
	};
}
