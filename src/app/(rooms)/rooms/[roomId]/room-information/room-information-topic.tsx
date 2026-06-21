"use client";

import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { useTopicTypewriter } from "@briom/rooms/hooks/animations";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationTopicProps {
	topic?: string | null;
}

export function RoomInformationTopic({ topic }: RoomInformationTopicProps) {
	const {
		refs: { container, text },
		topic: displayTopic,
	} = useTopicTypewriter(topic);

	return (
		<AccordionItem value="topic">
			<RoomInformationHeader title="Topic" />
			<AccordionContent className="border-t p-4">
				<div ref={container}>
					{displayTopic ? (
						<p
							className="text-xs text-muted-foreground leading-relaxed font-mono"
							ref={text}
						>
							{displayTopic}
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
