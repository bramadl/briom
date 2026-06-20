import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationTopicProps {
	topic?: string | null;
}

export function RoomInformationTopic({ topic }: RoomInformationTopicProps) {
	return (
		<AccordionItem value="topic">
			<RoomInformationHeader title="Topic" />
			<AccordionContent className="border-t p-4">
				{topic ? (
					<p className="text-xs text-muted-foreground leading-relaxed">
						{topic}
					</p>
				) : (
					<p className="text-xs text-muted-foreground/50 italic leading-relaxed">
						Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quae nisi
						neque omnis? Vitae pariatur earum quam minima eius dolor,
						perspiciatis inventore? Quas sapiente labore voluptatum voluptatem
						nulla, autem officia perspiciatis laboriosam nesciunt?
					</p>
				)}
			</AccordionContent>
		</AccordionItem>
	);
}
