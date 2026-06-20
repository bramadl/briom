"use client";

import type { RoomDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Badge } from "@briom/components/ui/badge";
import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";
import { PlusIcon } from "lucide-react";

import { PARTICIPANT_COLORS } from "../../mappings/participant-colors.map";
import { MAXIMUM_PARTICIPANT } from "../../room-composer/room-settings";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationParticipantListProps {
	participants: RoomDTO["participants"];
}

export function RoomInformationParticipantList({
	participants,
}: RoomInformationParticipantListProps) {
	return (
		<AccordionItem value="participants">
			<RoomInformationHeader title={`Participants (${participants.length})`}>
				{participants.length === MAXIMUM_PARTICIPANT ? (
					<Badge className="text-[10px]" variant="outline">
						Max Participants
					</Badge>
				) : (
					<Button
						onClick={(e) => {
							e.preventDefault();
						}}
						size="icon-xs"
						variant="ghost"
					>
						<PlusIcon className="text-muted-foreground" />
					</Button>
				)}
			</RoomInformationHeader>
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					{participants.map((p, i) => {
						const theme = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
						return (
							<li className="flex items-start gap-2.5" key={p.id}>
								<span
									className={cn(
										"w-2 h-2 rounded-full shrink-0 translate-y-[7px]",
										theme?.all,
									)}
								/>
								<div className="min-w-0 flex flex-col gap-0">
									<p className="text-sm text-foreground truncate mb-0!">
										{p.name}
									</p>
									<p className="text-[10px] text-muted-foreground/60 font-mono truncate">
										{p.provider}/{p.model}
									</p>
								</div>
							</li>
						);
					})}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
