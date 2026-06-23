import type { TurnProposalDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";

interface TurnPerspectiveProposalsProps {
	act: (
		participantId: TurnProposalDTO["participantId"],
		intent: TurnProposalDTO["intent"],
	) => void;
	proposals: TurnProposalDTO[];
}

export function TurnPerspectiveProposals({
	proposals,
}: TurnPerspectiveProposalsProps) {
	return (
		<div className="flex flex-col items-end gap-1.5">
			<span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono">
				continue the discussion
			</span>
			<div className="flex flex-wrap justify-end gap-1.5">
				{proposals.map(({ label, participantId, name }) => {
					const tokens = label.split(name);

					return (
						<Button
							className="h-7 text-xs rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all font-normal "
							// opacity-0 translate-y-3 <-- will be animated later
							data-suggestion
							key={participantId}
							// onClick={() => onSelect(participant.id, act)}
							size="sm"
							variant="outline"
						>
							{tokens.map((token, i) =>
								token.includes(name) ? (
									<span
										className="text-foreground/80 font-medium mx-0.5"
										key={name}
									>
										{name}
									</span>
								) : (
									<span key={i.toString()}>{token}</span>
								),
							)}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
