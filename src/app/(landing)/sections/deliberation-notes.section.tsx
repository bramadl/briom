import { Container } from "@briom/components/ui/container";
import { FlaskConicalIcon } from "lucide-react";

const NOTES = [
	{
		id: "models",
		label: "Model Access",
		detail:
			"Pro models are currently restricted. Free-tier models are available — expect occasional rate limits, slower responses, and higher error rates. This is expected behaviour for this phase.",
	},
	{
		id: "rooms",
		label: "Room Limits",
		detail:
			"Each account is limited to 5 active rooms. This is a deliberate constraint while we observe how discussions evolve, not a permanent ceiling.",
	},
	{
		id: "participants",
		label: "Participant Ceiling",
		detail:
			"A maximum of 4 participants per room. Beyond this threshold, deliberation quality degrades faster than it scales — a tradeoff we are intentional about.",
	},
	{
		id: "length",
		label: "Long Deliberations",
		detail:
			"Extended transcripts are not yet optimised. As context grows, response quality may drift and errors may surface. Treat long sessions as exploratory, not authoritative.",
	},
	{
		id: "stability",
		label: "General Stability",
		detail:
			"Briom is an early deliberation environment, not a polished product. Rough edges exist and are known. The goal of this phase is to understand whether collaborative AI reasoning creates genuine value — not to demonstrate a flawless experience.",
	},
] as const;

export function DeliberationNotesSection() {
	return (
		<section className="border-t border-border/50">
			<Container className="py-20 sm:py-28">
				<div className="max-w-2xl mb-14">
					<div className="flex items-center gap-2 mb-4">
						<FlaskConicalIcon className="size-3.5 text-muted-foreground/60" />
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
							v0.0.1 — Early Deliberation Phase
						</p>
					</div>
					<h2 className="font-serif text-2xl sm:text-3xl leading-snug mb-4">
						Deliberation Notes{" "}
						<span className="text-xs text-muted-foreground/50 font-mono">
							(from the Founder's perspective)
						</span>
					</h2>
					<p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
						Briom is not yet the thing it intends to become. What follows is an
						honest account of what this environment can and cannot do in its
						current form — written for those who prefer to enter with clarity
						rather than expectation.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 border border-border/30 rounded-xl overflow-hidden">
					{NOTES.map((note) => (
						<div
							className="bg-background px-6 py-6 flex flex-col gap-2"
							key={note.id}
						>
							<p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
								{note.label}
							</p>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{note.detail}
							</p>
						</div>
					))}

					<div className="bg-background/50 px-6 py-6 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
						<p className="text-xs text-muted-foreground/50 leading-relaxed italic font-mono">
							"The goal is not a flawless experience. The goal is a more honest
							one."
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}
