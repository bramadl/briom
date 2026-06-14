"use client";

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { Separator } from "@briom/components/ui/separator";
import type { RoomSummaryDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface RoomListItemProps {
	room: RoomSummaryDTO;
}

export function RoomListItem({ room }: RoomListItemProps) {
	const { roomId } = useParams();
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<div
					className={cn(
						"relative flex flex-col gap-4 border-b p-4 text-sm leading-tight  last:border-b-0 transition-colors",
						roomId === room.id ? "bg-muted/50" : "hover:bg-muted/25",
					)}
				>
					<Link
						aria-label={`Open ${room.title} room`}
						className="absolute inset-0"
						href={`/rooms/${room.id}`}
					/>
					<div className="flex w-full items-center gap-2">
						<h2 className="font-serif text-base font-bold line-clamp-1">
							{room.title}
						</h2>
						{/* 1d ago, 3mo ago, 1y ago💀 – kata GPT, kita gak "peduli tanggal dibuat, tapi tanggal terakhir 'bermain'" */}
						<p className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
							2h ago
						</p>
					</div>
					<Separator />
					{/* last activity snippet */}
					<div className="flex flex-col gap-1">
						<span className="font-medium font-mono text-sm">Gemma:</span>
						<span className="line-clamp-2 text-muted-foreground text-xs">
							This is a vital distinction that brings a lot of clarity to the
							conversation. You are essentially separating the conceptual
							problem-solving from the technical implementation.
						</span>
					</div>
					<Separator />
					<div className="flex items-center justify-between gap-4">
						{/*
              green = active (last 10 min)
              yellow = stale (1 day)
              gray = dead
            */}
						<div className="size-3 bg-green-950 rounded-lg" />
						<div className="flex items-center gap-1 mx-1">
							<span className="size-5 text-[10px] bg-blue-600 rounded-full flex items-center justify-center -mx-1">
								G
							</span>
							<span className="size-5 text-[10px] bg-red-600 rounded-full flex items-center justify-center -mx-1">
								N
							</span>
							<span className="size-5 text-[10px] bg-slate-600 rounded-full flex items-center justify-center -mx-1">
								+2
							</span>
						</div>
					</div>
				</div>
			</HoverCardTrigger>
			<HoverCardContent align="center" side="right">
				<strong>AI Summary</strong>: <br />
				“Exploring architectural tradeoffs between DDD and MVP speed”
				{/*
          When no Summary yet:
          - show last 3 turns mini preview
          - like “conversation smell”
        */}
			</HoverCardContent>
		</HoverCard>
	);
}
