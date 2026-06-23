import type { RoomDTO, TurnDTO } from "@briom/app";
import { useMemo } from "react";

import {
	getParticipantTheme,
	type PARTICIPANT_THEMES,
} from "../participant/config/theme";

type Participant = RoomDTO["participants"][number];

export type ParticipantWithTheme = Participant & {
	theme: (typeof PARTICIPANT_THEMES)[number];
};

interface UseMiniTimelineProps {
	participants: Participant[];
	turns: TurnDTO[];
}

export function useMiniTimeline({ participants, turns }: UseMiniTimelineProps) {
	const participantMap = useMemo(() => {
		const map = new Map<string, ParticipantWithTheme>();
		participants.forEach((p) => {
			map.set(p.id, { ...p, theme: getParticipantTheme(p.id) });
		});
		return map;
	}, [participants]);

	const maxContentLength = useMemo(() => {
		if (turns.length === 0) return 1;
		return Math.max(...turns.map((t) => t.perspective.content?.length || 0), 1);
	}, [turns]);

	const calculateLogarithmicWidth = (content: string): string => {
		const length = content?.length || 0;
		if (length <= 0) return "1%";

		const ratio = length / maxContentLength;
		const smoothed = ratio ** 0.6;
		const minWidth = 8;
		const maxWidth = 100;

		return `${(minWidth + smoothed * (maxWidth - minWidth)).toFixed(1)}%`;
	};

	const handleScrollToTurn = (turnId: string) => {
		const element = document.getElementById(turnId);
		if (!element) return;

		element.scrollIntoView({ behavior: "smooth", block: "center" });

		let isScrolling: NodeJS.Timeout;
		const flashClass = "animate-turn-flash";

		const triggerWobble = () => {
			window.removeEventListener("scroll", scrollHandler);

			element.classList.remove(flashClass);
			void element.offsetWidth;
			element.classList.add(flashClass);

			setTimeout(() => {
				element.classList.remove(flashClass);
			}, 1200);
		};

		const scrollHandler = () => {
			clearTimeout(isScrolling);
			isScrolling = setTimeout(triggerWobble, 300);
		};

		window.addEventListener("scroll", scrollHandler);
		setTimeout(() => {
			window.removeEventListener("scroll", scrollHandler);
			if (!element.classList.contains(flashClass)) {
				element.classList.add(flashClass);
				setTimeout(() => element.classList.remove(flashClass), 1200);
			}
		}, 500);
	};

	return {
		participantMap,
		calculateLogarithmicWidth,
		handleScrollToTurn,
	};
}
