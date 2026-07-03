"use client";

import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const PRINCIPLES = [
	{
		desc: "Briom doesn't run autonomous AI debates. You decide who speaks, when, and what happens next — at every step. The room moves when you move it.",
		label: "Human-led, always",
	},
	{
		desc: "All participants read the same conversation. No copying answers between tabs. No re-explaining context. The room itself becomes shared cognitive space.",
		label: "Shared context",
	},
	{
		desc: "One turn at a time, each building on what came before. A discussion you can follow and steer — not a wall of simultaneous answers demanding to be compared.",
		label: "Sequential, not chaotic",
	},
	{
		desc: "The goal isn't a faster answer. It's a sharper understanding. Briom is built for questions where perspective creates depth that a single voice can't reach.",
		label: "Discussion over generation",
	},
] as const;

export function PrinciplesSection() {
	const rootRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			registerGsap();

			gsap.to("[data-principle]", {
				duration: 0.7,
				ease: "power3.out",
				opacity: 1,
				scrollTrigger: {
					start: "top 75%",
					trigger: rootRef.current,
				},
				stagger: 0.12,
				y: 0,
			});
		},
		{ scope: rootRef },
	);

	return (
		<section className="border-y border-border/50 bg-muted/20" ref={rootRef}>
			<Container className="py-24 sm:py-32">
				<div className="max-w-2xl mb-16">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
						The principles
					</p>
					<h2 className="font-serif text-3xl sm:text-4xl leading-tight">
						Built so the room stays a room — not a feed.
					</h2>
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
					{PRINCIPLES.map(({ label, desc }) => (
						<div className="opacity-0 translate-y-5" data-principle key={label}>
							<div className="h-px w-10 bg-primary mb-5" />
							<h3 className="font-serif text-lg mb-2">{label}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{desc}
							</p>
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
