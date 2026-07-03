import { useTypewriter } from "@briom/hooks/use-typewriter";

interface RoomTitleProps {
	roomTitle: string;
}

export function RoomTitle({ roomTitle }: RoomTitleProps) {
	const { containerRef, text, textRef } = useTypewriter(roomTitle);

	return (
		<header ref={containerRef}>
			<h2 className="font-bold font-serif text-base line-clamp-1" ref={textRef}>
				{text}
			</h2>
		</header>
	);
}
