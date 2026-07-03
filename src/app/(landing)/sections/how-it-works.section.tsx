"use client";

import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const STEPS = [
	{
		desc: "Name your thinking space. Bring a question you're still working through, a dilemma with no clean answer, or a decision with real stakes. This becomes the shared context for everyone in the room.",
		step: "01",
		title: "Open a room",
	},
	{
		desc: "Invite the models you want — Claude, GPT, Gemini, or others available through OpenRouter. Every participant sees the same conversation from the first turn. No repeated prompting, no context loss.",
		step: "02",
		title: "Invite participants",
	},
	{
		desc: 'You decide who speaks next and why. "Claude, respond." "GPT, push back on that." "Gemini, find the synthesis." One voice at a time, building on what came before.',
		step: "03",
		title: "Moderate the discussion",
	},
	{
		desc: "Perspectives accumulate instead of repeating themselves. Disagreements surface. Assumptions break. The conversation reaches places a single model — or a single person — wouldn't have reached alone.",
		step: "04",
		title: "Watch thinking evolve",
	},
] as const;

export function HowItWorksSection() {
	const rootRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			registerGsap();

			gsap.to("[data-line-fill]", {
				ease: "none",
				scaleY: 1,
				scrollTrigger: {
					end: "bottom 70%",
					scrub: true,
					start: "top 60%",
					trigger: "[data-steps]",
				},
			});

			const items = gsap.utils.toArray<HTMLElement>("[data-step]");
			items.forEach((item) => {
				gsap.to(item, {
					ease: "power2.out",
					opacity: 1,
					scrollTrigger: {
						start: "top 75%",
						toggleActions: "play none none reverse",
						trigger: item,
					},
				});
			});
		},
		{ scope: rootRef },
	);

	return (
		<section ref={rootRef}>
			<Container className="py-24 sm:py-32">
				<div className="max-w-2xl mb-16">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
						How it works
					</p>
					<h2 className="font-serif text-3xl sm:text-4xl leading-tight">
						You stay the moderator. The room does the thinking out loud.
					</h2>
				</div>

				<div className="relative max-w-2xl" data-steps>
					<div
						aria-hidden
						className="absolute left-[19px] top-2 bottom-2 w-px bg-border"
					/>

					<div
						aria-hidden
						className="absolute left-[19px] top-2 bottom-2 w-px bg-primary origin-top scale-y-0"
						data-line-fill
					/>

					<div className="flex flex-col gap-12">
						{STEPS.map(({ step, title, desc }) => (
							<div className="relative pl-14 opacity-25" data-step key={step}>
								<span className="absolute left-0 top-0 flex items-center justify-center size-10 rounded-full border border-border bg-background font-mono text-xs text-muted-foreground">
									{step}
								</span>
								<h3 className="font-serif text-xl mb-2">{title}</h3>
								<p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
									{desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
