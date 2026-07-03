"use client";

import { Container } from "@briom/components/ui/container";
import { gsap, registerGsap } from "@briom/libs/providers/gsap/register";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const WORKFLOW_STEPS = [
	{ label: "Ask GPT", note: "Good start. But missing Claude's angle." },
	{ label: "Copy the answer", note: "Ctrl+C. Here we go." },
	{ label: "Paste into Claude", note: "Repeat context. Again." },
	{ label: "Compare perspectives", note: "In your head. Manually." },
	{ label: "Relay disagreements", note: "You're the messenger now." },
	{
		label: "Repeat endlessly",
		note: "Until you give up or decide arbitrarily.",
	},
] as const;

export function ProblemSection() {
	const rootRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			registerGsap();

			gsap.to("[data-problem-title]", {
				duration: 0.8,
				ease: "power3.out",
				opacity: 1,
				scrollTrigger: { start: "top 75%", trigger: "[data-problem-title]" },
				y: 0,
			});

			const steps = gsap.utils.toArray<HTMLElement>("[data-workflow-step]");
			steps.forEach((step, i) => {
				gsap.to(step, {
					delay: i * 0.07,
					duration: 0.5,
					ease: "power2.out",
					opacity: 1,
					scrollTrigger: {
						start: "top 80%",
						toggleActions: "play none none none",
						trigger: step,
					},
					y: 0,
				});
			});

			gsap.to("[data-problem-conclusion]", {
				duration: 0.8,
				ease: "power3.out",
				opacity: 1,
				scrollTrigger: {
					start: "top 80%",
					trigger: "[data-problem-conclusion]",
				},
				y: 0,
			});
		},
		{ scope: rootRef },
	);

	return (
		<section ref={rootRef}>
			<Container className="py-24 sm:py-32">
				<div
					className="max-w-2xl mb-16 opacity-0 translate-y-6"
					data-problem-title
				>
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
						The problem
					</p>
					<h2 className="font-serif text-3xl sm:text-4xl leading-tight">
						You became the one passing notes between AI models.
					</h2>
					<p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
						Every time you needed a second opinion, a critique, or a different
						angle — you had to do it yourself. Copy. Paste. Relay. Repeat.
					</p>
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mb-16">
					{WORKFLOW_STEPS.map(({ label, note }, i) => (
						<div
							className="opacity-0 translate-y-4 flex gap-3 p-4 rounded-lg border border-border/50 bg-muted/20"
							data-workflow-step
							key={label}
						>
							<span className="font-mono text-[11px] text-muted-foreground/40 mt-0.5 shrink-0 w-5">
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className="min-w-0">
								<p className="text-sm font-medium text-foreground/90 mb-0.5">
									{label}
								</p>
								<p className="text-xs text-muted-foreground/60 leading-relaxed">
									{note}
								</p>
							</div>
						</div>
					))}
				</div>

				<div
					className="max-w-2xl opacity-0 translate-y-4"
					data-problem-conclusion
				>
					<div className="h-px w-10 bg-primary mb-5" />
					<p className="font-serif text-lg sm:text-xl text-foreground/80 leading-relaxed">
						The more advanced your thinking became, the more fragmented the
						experience felt. The models weren't the problem — the architecture
						of isolation was.
					</p>
				</div>
			</Container>
		</section>
	);
}
