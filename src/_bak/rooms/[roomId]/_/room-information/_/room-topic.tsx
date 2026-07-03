"use client";

import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { useTypewriter } from "@briom/hooks/use-typewriter";

interface RoomTopicProps {
	topic?: string | null;
}

export function RoomTopic({ topic }: RoomTopicProps) {
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
