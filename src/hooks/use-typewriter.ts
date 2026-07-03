import { gsap } from "@briom/libs/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

export function useTypewriter(initialContent?: string | null) {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLParagraphElement>(null);

	const [text, setText] = useState(initialContent);
	useGSAP(
		() => {
			if (!initialContent || initialContent === text || !containerRef.current) {
				return;
			}

			const tl = gsap.timeline({ onComplete: () => setText(initialContent) });
			if (textRef.current) {
				tl.to(textRef.current, {
					opacity: 0,
					y: -4,
					duration: 0.2,
					ease: "power2.in",
				});
			}

			tl.set(textRef.current, { opacity: 1, y: 0 });
			const chars = initialContent.split("");
			let currentText = "";

			tl.call(() => void setText(""));
			chars.forEach((char, i) => {
				tl.call(
					() => {
						currentText += char;
						setText(currentText);
					},
					[],
					i * 0.03,
				);
			});
		},
		{ scope: containerRef, dependencies: [initialContent] },
	);

	return { containerRef, textRef, text };
}
