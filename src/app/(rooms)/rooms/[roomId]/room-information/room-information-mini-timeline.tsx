"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Button } from "@briom/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { cn } from "@briom/libs/utils";
import { ExpandIcon } from "lucide-react";

import { PARTICIPANT_COLORS } from "../../mappings/participant-colors.map";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationMiniTimelineProps {
	participants: RoomDTO["participants"];
	turns: TurnDTO[];
}

export function RoomInformationMiniTimeline({
	participants,
}: RoomInformationMiniTimelineProps) {
	const participantMap = new Map<string, (typeof PARTICIPANT_COLORS)[number]>();
	participants.forEach((p, i) => {
		participantMap.set(p.id, PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length]);
	});

	return (
		<AccordionItem value="timeline">
			<RoomInformationHeader title="Timeline">
				<Button
					onClick={(e) => {
						e.preventDefault();
					}}
					size="icon-xs"
					variant="ghost"
				>
					<ExpandIcon className="text-muted-foreground" />
				</Button>
			</RoomInformationHeader>
			<AccordionContent className="border-t p-4">
				{/* {turns.length === 0 ? (
					<p className="text-xs text-muted-foreground/50 italic">
						Start deliberating blablabla
					</p>
				) : (
					turns.map((turn) => {
						const isModeratorTurn = turn.author.type === "moderator";
						return (
							<li
								className={cn("flex", isModeratorTurn && "justify-end")} <-- moderator = mojok kanan
								key={turn.id}
							>
								<button
									className={cn("bg-primary rounded-lg inline-block w-40 h-1.5 opacity-50 hover:opacity-100 transition-opacity")}
									type="button"
								/>
							
						);
					})
				)} */}

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex justify-end w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn("bg-primary rounded-lg inline-block w-40 h-1.5")}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[0].dot,
								"rounded-lg inline-block w-40 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex justify-end w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn("bg-primary rounded-lg inline-block w-24 h-1.5")}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[0].dot,
								"rounded-lg inline-block w-60 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[1].dot,
								"rounded-lg inline-block w-24 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[2].dot,
								"rounded-lg inline-block w-40 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex justify-end w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn("bg-primary rounded-lg inline-block w-40 h-1.5")}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[0].dot,
								"rounded-lg inline-block w-40 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex justify-end w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn("bg-primary rounded-lg inline-block w-24 h-1.5")}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[0].dot,
								"rounded-lg inline-block w-60 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[1].dot,
								"rounded-lg inline-block w-24 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>

				<HoverCard closeDelay={0} openDelay={0}>
					<HoverCardTrigger
						className="flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						onClick={() => {
							// scroll to this turn, lol.
						}}
					>
						<span
							className={cn(
								PARTICIPANT_COLORS[2].dot,
								"rounded-lg inline-block w-40 h-1.5",
							)}
						/>
					</HoverCardTrigger>
					<HoverCardContent align="center" side="left">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo
						deleniti non quos quod cum dolor saepe.
					</HoverCardContent>
				</HoverCard>
			</AccordionContent>
		</AccordionItem>
	);
}
