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

			const cards = gsap.utils.toArray<HTMLElement>("[data-room-card]");
			const indicators = gsap.utils.toArray<HTMLElement>(
				"[data-room-indicator]",
			);

			cards.forEach((card, i) => {
				const indicator = indicators[i];

				const tl = gsap.timeline({
					scrollTrigger: {
						start: "top 78%",
						toggleActions: "play none none none",
						trigger: card,
					},
				});

				if (indicator) {
					tl.to(indicator, { duration: 0.2, opacity: 1 })
						.to(indicator, { duration: 0.5, opacity: 1 }, "+=0.35")
						.to(indicator, { duration: 0.15, opacity: 0 });
				}

				tl.to(card, {
					duration: 0.6,
					ease: "power3.out",
					opacity: 1,
					y: 0,
				});
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
					{ROOM_PREVIEW_TURNS.map((turn, i) => (
						<div
							className="opacity-0 translate-y-7"
							data-room-card
							key={`${turn.displayName}-${i.toString()}`}
						>
							{!turn.isUser && (
								<div
									className="flex items-center gap-2 mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground opacity-0"
									data-room-indicator
								>
									<span className="relative flex size-2">
										<span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
										<span className="relative inline-flex rounded-full size-2 bg-primary" />
									</span>
									{turn.displayName} is typing
								</div>
							)}
							<RoomMessageCard turn={turn} />
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
