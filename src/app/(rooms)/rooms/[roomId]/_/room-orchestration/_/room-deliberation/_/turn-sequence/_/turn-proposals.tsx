"use client";

import type { TurnProposalDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";

interface TurnProposalsProps {
	onSelect?: (proposal: TurnProposalDTO) => void;
	proposals: TurnProposalDTO[];
}

export function TurnProposals({ proposals, onSelect }: TurnProposalsProps) {
	if (!proposals || proposals.length === 0) return null;
	return (
		<div className="flex flex-col items-end gap-1.5">
			<span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono select-none">
				continue the discussion
			</span>
			<div className="flex flex-wrap justify-end gap-1.5">
				{proposals.map((proposal) => {
					const { label, participantId, name, confidence, intent } = proposal;
					const tokens = label.split(new RegExp(`(${name})`, "g"));

					return (
						<Button
							className="h-7 text-xs rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all font-normal"
							data-suggestion
							key={`${participantId}:${intent}:${confidence}`}
							onClick={() => onSelect?.(proposal)}
							size="sm"
							variant="outline"
						>
							{tokens.map((token, i) =>
								token === name ? (
									<span
										className="text-foreground/80 font-medium"
										key={i.toString()}
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
