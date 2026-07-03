"use client";

import { useAuthModal } from "@briom/(auth)";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/providers/gsap/register";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export function HeroSection() {
	const { openAuth } = useAuthModal();

	const rootRef = useRef<HTMLDivElement>(null);
	useGSAP(
		() => {
			registerGsap();
			gsap
				.timeline({ defaults: { ease: "power3.out" } })
				.to("[data-hero-reveal]", {
					duration: 0.9,
					opacity: 1,
					stagger: 0.12,
					y: 0,
				})
				.to("[data-hero-fade]", { duration: 0.8, opacity: 1 }, "-=0.4");
		},
		{ scope: rootRef },
	);

	return (
		<section className="relative" ref={rootRef}>
			<Container
				as="div"
				className="min-h-[calc(100svh-(var(--spacing)*24))] flex flex-col justify-center py-20"
			>
				<p
					className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 opacity-0 translate-y-6"
					data-hero-reveal
				>
					Collaborative AI Deliberation
				</p>

				<h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.1] max-w-3xl">
					<span className="block opacity-0 translate-y-6" data-hero-reveal>
						Stop bridging ideas
					</span>
					<span className="block opacity-0 translate-y-6" data-hero-reveal>
						between AI models.
					</span>
					<span
						className="block text-primary opacity-0 translate-y-6"
						data-hero-reveal
					>
						That ends here.
					</span>
				</h1>

				<p
					className="mt-8 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed opacity-0"
					data-hero-fade
				>
					Briom is a deliberation room where multiple AI participants share the
					same context, build on each other's reasoning, and surface
					perspectives you wouldn't reach alone — while you stay in control of
					every turn.
				</p>

				<div
					className="mt-10 flex flex-col sm:flex-row items-start gap-4 opacity-0"
					data-hero-fade
				>
					<Button className="group" onClick={openAuth} size="lg">
						Open a room
						<ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
					</Button>
					<p className="text-sm text-muted-foreground sm:self-center">
						Free to start. Bring a question.
					</p>
				</div>
			</Container>
		</section>
	);
}
