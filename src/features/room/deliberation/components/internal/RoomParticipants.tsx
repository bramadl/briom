"use client";

import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { getParticipantTheme } from "@briom/room/participant/settings/theme";
import { useMemo } from "react";

export function RoomParticipants() {
	const { canInviteParticipant, room } = useRoom();

	const participants = useMemo(
		() => room.info.participants,
		[room.info.participants],
	);

	return (
		<AccordionItem value="participants">
			<AccordionExpander title={`Participants (${participants.length})`}>
				{!canInviteParticipant && (
					<Badge className="text-[10px]" variant={"outline"}>
						Max
					</Badge>
				)}
			</AccordionExpander>
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					{participants.map(({ id, model, name }) => (
						<li className="flex items-start gap-2.5" key={id}>
							<div
								className={cn(
									"w-2 h-2 rounded-full shrink-0 translate-y-[7px]",
									getParticipantTheme(id).dot,
								)}
							/>
							<div className="min-w-0 flex flex-col gap-0">
								<p className="text-sm text-foreground truncate mb-0!">{name}</p>
								<p className="text-[10px] text-muted-foreground/60 font-mono truncate">
									{model}
								</p>
							</div>
						</li>
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
