import { gsap } from "@briom/libs/next/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

export function useTopicTypewriter(initialTopic?: string | null) {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLParagraphElement>(null);

	const [topic, setTopic] = useState(initialTopic);
	useGSAP(
		() => {
			if (!initialTopic || initialTopic === topic || !containerRef.current) {
				return;
			}

			const tl = gsap.timeline({
				onComplete: () => void setTopic(initialTopic),
			});

			if (textRef.current) {
				tl.to(textRef.current, {
					opacity: 0,
					y: -4,
					duration: 0.2,
					ease: "power2.in",
				});
			}

			tl.set(textRef.current, { opacity: 1, y: 0 });

			const chars = initialTopic.split("");
			let currentText = "";

			tl.call(() => void setTopic(""));
			chars.forEach((char, i) => {
				tl.call(
					() => {
						currentText += char;
						setTopic(currentText);
					},
					[],
					i * 0.03,
				);
			});
		},
		{ scope: containerRef, dependencies: [initialTopic] },
	);

	return { refs: { container: containerRef, text: textRef }, topic };
}
