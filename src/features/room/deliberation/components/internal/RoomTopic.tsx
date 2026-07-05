"use client";

import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { useTypewriter } from "@briom/hooks/use-typewriter";
import { useRoom } from "@briom/room/hooks/use-room";
import { useMemo } from "react";

export function RoomTopic() {
	const { room } = useRoom();

	const topic = useMemo(() => room.info.topic, [room.info.topic]);

	const { containerRef, text, textRef } = useTypewriter(topic);

	return (
		<AccordionItem value="topic">
			<AccordionExpander title="Topic" />
			<AccordionContent className="border-t p-4">
				<div ref={containerRef}>
					{text ? (
						<p
							className="text-xs text-muted-foreground leading-relaxed font-mono"
							ref={textRef}
						>
							{text}
						</p>
					) : (
						<p className="text-xs text-muted-foreground/50 italic leading-relaxed">
							No topic set yet. Start deliberation to define what this room will
							explore together.
						</p>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
