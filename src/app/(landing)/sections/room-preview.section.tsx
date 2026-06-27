"use client";

import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/next/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { ROOM_PREVIEW_TURNS } from "../_/data/room-preview.data";
import { RoomMessageCard } from "../_/ui/room-message-card";

export function RoomPreviewSection() {
	const rootRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			registerGsap();

			const wrappers = gsap.utils.toArray<HTMLElement>("[data-turn-wrapper]");

			wrappers.forEach((wrapper) => {
				const indicator = wrapper.querySelector<HTMLElement>(
					"[data-room-indicator]",
				);
				const shimmer = wrapper.querySelector<HTMLElement>(
					"[data-room-shimmer]",
				);
				const card = wrapper.querySelector<HTMLElement>("[data-room-card]");
				const isUser = wrapper.dataset.isUser === "true";

				if (!card) return;

				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: wrapper,
						start: "top 80%",
						toggleActions: "play none none none",
					},
				});

				if (isUser) {
					// User: simple slide-in from right
					gsap.set(card, { opacity: 0, x: 20 });
					tl.to(card, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" });
				} else {
					// AI: indicator → shimmer → card
					if (indicator) gsap.set(indicator, { opacity: 0 });
					if (shimmer) gsap.set(shimmer, { opacity: 0 });
					gsap.set(card, { opacity: 0, x: -12 });

					// ① indicator blinks in
					if (indicator) {
						tl.to(indicator, {
							opacity: 1,
							duration: 0.25,
							ease: "power2.out",
						});
					}
					// ② shimmer bars appear right after
					if (shimmer) {
						tl.to(
							shimmer,
							{ opacity: 1, duration: 0.2, ease: "power2.out" },
							"<+0.1",
						);
					}
					// ③ hold — gives the "thinking" impression
					tl.to({}, { duration: 0.55 });
					// ④ shimmer + indicator fade out, card slides in
					if (shimmer)
						tl.to(shimmer, { opacity: 0, duration: 0.18, ease: "power2.in" });
					if (indicator)
						tl.to(
							indicator,
							{ opacity: 0, duration: 0.18, ease: "power2.in" },
							"<",
						);
					tl.to(
						card,
						{ opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
						"<+0.05",
					);
				}
			});
		},
		{ scope: rootRef },
	);

	return (
		<section className="border-y border-border/50" ref={rootRef}>
			<Container className="py-24 sm:py-32">
				<div className="max-w-2xl mb-16">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
						Inside a room
					</p>
					<h2 className="font-serif text-3xl sm:text-4xl leading-tight">
						One question. Three perspectives. A real exchange.
					</h2>
				</div>

				<div className="max-w-3xl mx-auto flex flex-col gap-10">
					{ROOM_PREVIEW_TURNS.map((turn, i) => {
						const isUser = turn.isUser ?? false;

						return (
							<div
								className="relative"
								data-is-user={String(isUser)}
								data-turn-wrapper
								key={`${turn.displayName}-${i.toString()}`}
							>
								{/* "is thinking" indicator — AI turns only */}
								{!isUser && (
									<div
										className="flex items-center gap-2 mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
										data-room-indicator
									>
										<span className="relative flex size-2">
											<span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
											<span className="relative inline-flex rounded-full size-2 bg-primary" />
										</span>
										{turn.displayName} is thinking
									</div>
								)}

								{/* Shimmer skeleton — absolute so it doesn't shift layout */}
								{!isUser && (
									<div
										className="absolute left-4 right-0 space-y-2 pointer-events-none"
										data-room-shimmer
										style={{ top: "2rem" }}
									>
										<div className="h-3 rounded shimmer-bar w-[88%]" />
										<div className="h-3 rounded shimmer-bar w-[70%]" />
										<div className="h-3 rounded shimmer-bar w-[55%]" />
									</div>
								)}

								{/* Real card — initial state set by GSAP */}
								<div data-room-card>
									<RoomMessageCard turn={turn} />
								</div>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
