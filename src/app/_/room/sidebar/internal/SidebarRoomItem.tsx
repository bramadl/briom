"use client";

import { ParticipantBadge } from "@briom/app/_/room/participant";
import { AnchorLink } from "@briom/components/ui/anchor-link";
import { Separator } from "@briom/components/ui/separator";
import { useSidebar } from "@briom/components/ui/sidebar";
import type { RoomOverviewDTO } from "@briom/core/app";
import { useTypewriter } from "@briom/hooks/use-typewriter";
import { cn } from "@briom/libs/utils";
import { useParams } from "next/navigation";

import { ROOM_THEME } from "../../settings/theme.";

function RoomTitle({ title }: { title: RoomOverviewDTO["title"] }) {
	const { containerRef, text, textRef } = useTypewriter(title);
	return (
		<header ref={containerRef}>
			<h2 className="font-bold font-serif text-base line-clamp-1" ref={textRef}>
				{text}
			</h2>
		</header>
	);
}

function RoomTopic({ topic }: { topic: RoomOverviewDTO["topic"] }) {
	const { containerRef, textRef, text } = useTypewriter(topic);
	return (
		<div className="flex flex-col gap-1">
			<p className="font-medium font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
				{text ? "Topic" : "No topic yet"}
			</p>
			<p ref={containerRef}>
				<span
					className={cn(
						"line-clamp-2 text-xs leading-relaxed",
						text ? "text-muted-foreground" : "text-muted-foreground/40 italic",
					)}
					ref={textRef}
				>
					{text
						? text
						: "Bring your first topic into the room and start the deliberation"}
				</span>
			</p>
		</div>
	);
}

function RoomStatus({ status }: { status: RoomOverviewDTO["status"] }) {
	const theme = ROOM_THEME.status[status];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
				theme.class,
			)}
		>
			{theme.label}
		</span>
	);
}

function RoomParticipants({
	participants,
}: {
	participants: RoomOverviewDTO["participants"];
}) {
	if (participants.length === 0) {
		return (
			<span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
				No participants yet
			</span>
		);
	}

	return (
		<div className="flex items-center -space-x-1.5">
			{participants.slice(0, 4).map((participant) => (
				<ParticipantBadge
					key={participant.id}
					name={participant.name}
					participantId={participant.id}
				/>
			))}
			{participants.length > 4 && <ParticipantBadge className="bg-muted" />}
		</div>
	);
}

export function SidebarRoomItem({
	participants,
	id,
	status,
	title,
	topic,
}: RoomOverviewDTO) {
	const { open } = useSidebar();
	const { roomId } = useParams<{ roomId: string }>();

	const isActive = roomId === id;
	return (
		<div
			className={cn(
				"group relative flex flex-col gap-3 border-b last:border-0 p-4 text-sm leading-tight transition-colors",
				isActive ? "bg-muted/50" : "hover:bg-muted/25",
			)}
		>
			<AnchorLink
				href={`/rooms/${id}`}
				label={`Open ${title} room`}
				tabIndex={open ? 1 : -1}
			/>

			<RoomTitle title={title} />
			<Separator />
			<RoomTopic topic={topic} />
			<Separator />
			<div className="flex items-center justify-between">
				<RoomStatus status={status} />
				<RoomParticipants participants={participants} />
			</div>
		</div>
	);
}
