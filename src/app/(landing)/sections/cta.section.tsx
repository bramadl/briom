"use client";

import { useAuthModal } from "@briom/(auth)";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/providers/gsap/register";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export function CtaSection() {
	const { openAuth } = useAuthModal();

	const rootRef = useRef<HTMLDivElement>(null);
	useGSAP(
		() => {
			registerGsap();
			gsap.to("[data-cta-reveal]", {
				duration: 0.8,
				ease: "power3.out",
				opacity: 1,
				scrollTrigger: { start: "top 70%", trigger: rootRef.current },
				stagger: 0.1,
				y: 0,
			});

			gsap.to("[data-cta-glow]", {
				ease: "none",
				scrollTrigger: {
					end: "bottom top",
					scrub: true,
					start: "top bottom",
					trigger: rootRef.current,
				},
				y: -60,
			});
		},
		{ scope: rootRef },
	);

	return (
		<section className="relative overflow-hidden" ref={rootRef}>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 size-125 rounded-full bg-primary/10 blur-[120px]"
				data-cta-glow
			/>

			<Container className="relative py-24 sm:py-32 flex flex-col items-center text-center gap-6">
				<p
					className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground opacity-0 translate-y-5"
					data-cta-reveal
				>
					Open a room
				</p>
				<h2
					className="font-serif text-3xl sm:text-5xl leading-tight max-w-xl opacity-0 translate-y-5"
					data-cta-reveal
				>
					The next idea you're stuck on deserves a room, not a single chat.
				</h2>
				<p
					className="text-muted-foreground text-sm sm:text-base max-w-md opacity-0 translate-y-5"
					data-cta-reveal
				>
					Invite a few minds into the room. Introduce your question. Let the
					deliberation begin.
				</p>
				<div className="opacity-0 translate-y-5" data-cta-reveal>
					<Button className="group" onClick={openAuth} size="lg">
						Start deliberating
						<ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
					</Button>
				</div>
			</Container>
		</section>
	);
}
