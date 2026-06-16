"use client";

import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { Button } from "@briom/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@briom/components/ui/input-group";
import { EditIcon, Trash2 } from "lucide-react";

export interface StagedParticipant {
	displayName: string;
	key: string;
	model: string;
	provider: string;
}

interface ParticipantRowProps {
	canRemove?: boolean;
	onChange: (next: StagedParticipant) => void;
	onRemove: () => void;
	participant: StagedParticipant;
}

export function ParticipantRow({
	canRemove = true,
	onChange,
	onRemove,
	participant,
}: ParticipantRowProps) {
	return (
		<div className="w-full flex items-start justify-between gap-2">
			<Avatar className="shrink-0">
				<AvatarFallback className="text-xs font-mono">
					{participant.displayName.slice(0, 1).toUpperCase() || "?"}
				</AvatarFallback>
			</Avatar>

			<div className="flex flex-col gap-1 flex-1">
				<InputGroup>
					<InputGroupInput
						className="w-full"
						onChange={(e) =>
							onChange({ ...participant, displayName: e.target.value })
						}
						placeholder="Display name"
						value={participant.displayName}
					/>
					<InputGroupAddon align="inline-end">
						<EditIcon />
					</InputGroupAddon>
				</InputGroup>
				<div className="flex items-center justify-between gap-4 px-2.5">
					<p className="text-xs text-muted-foreground">
						<strong>Provider</strong>: {participant.provider}
					</p>
					<p className="text-xs text-muted-foreground">
						<strong>Model</strong>: {participant.model}
					</p>
				</div>
			</div>

			<Button
				className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
				disabled={!canRemove}
				onClick={onRemove}
				size="icon"
				type="button"
				variant="ghost"
			>
				<Trash2 className="size-4" />
				<span className="sr-only">Remove participant</span>
			</Button>
		</div>
	);
}
