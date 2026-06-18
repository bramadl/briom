"use client";

import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/next/gsap/register";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function HeroSection() {
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
				.to(
					"[data-hero-fade]",
					{
						duration: 0.8,
						opacity: 1,
					},
					"-=0.4",
				);
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
					Think Together
				</p>

				<h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.1] max-w-3xl">
					<span className="block opacity-0 translate-y-6" data-hero-reveal>
						Stop relaying ideas
					</span>
					<span className="block opacity-0 translate-y-6" data-hero-reveal>
						between AI models.
					</span>
					<span
						className="block text-primary opacity-0 translate-y-6"
						data-hero-reveal
					>
						Start a discussion.
					</span>
				</h1>

				<p
					className="mt-8 max-w-md text-base sm:text-lg text-muted-foreground leading-relaxed opacity-0"
					data-hero-fade
				>
					Briom is a room where multiple AI participants share the same
					conversation. You bring the question. They respond, critique, and
					build on each other — while you decide what happens next.
				</p>

				<div
					className="mt-10 flex flex-col sm:flex-row items-start gap-4 opacity-0"
					data-hero-fade
				>
					<Button asChild className="group" size="lg">
						<Link href="/rooms">
							Open a room
							<ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
						</Link>
					</Button>
					<p className="text-sm text-muted-foreground self-center">
						No setup. Bring your own question.
					</p>
				</div>
			</Container>
		</section>
	);
}
