"use client";

import { Button } from "@briom/components/ui/button";
import { Separator } from "@briom/components/ui/separator";
import type { TurnProposalDTO } from "@briom/core/app";
import { Fragment } from "react/jsx-runtime";

interface TurnProposalsProps {
	/**
	 * @description
	 * Fires when a proposal is selected.
	 */
	onSelect: (proposal: TurnProposalDTO) => void;

	/**
	 * @description
	 * List of proposals generated.
	 * Pass in empty array to not display the node.
	 */
	proposals: TurnProposalDTO[];
}

export function TurnProposals({ proposals, onSelect }: TurnProposalsProps) {
	if (proposals.length === 0) return null;
	return (
		<Fragment>
			<Separator className="opacity-50" />
			<div className="flex flex-col items-end gap-1.5 animate-in fade-in-0 slide-in-from-bottom-5 fill-mode-backwards duration-300 delay-1000">
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
		</Fragment>
	);
}
