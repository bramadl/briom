import { useTypewriter } from "@briom/hooks/use-typewriter";
import { cn } from "@briom/libs/utils";

interface RoomTopicProps {
	topic: string | null;
}

export function RoomTopic({ topic }: RoomTopicProps) {
	const { containerRef, textRef, text } = useTypewriter(topic);
	return (
		<div className="flex flex-col gap-1">
			<p className="font-medium font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
				{text ? "Topic" : "No topic yet"}
			</p>
			<p ref={containerRef}>
				<span
					className={cn(
						"line-clamp-2 text-xs leading-relaxed",
						text ? "text-muted-foreground" : "text-muted-foreground/40 italic",
					)}
					ref={textRef}
				>
					{text
						? text
						: "Bring your first topic into the room and start the deliberation"}
				</span>
			</p>
		</div>
	);
}
