"use client";

import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useRenameRoomMutation } from "@briom/rooms/_/room/mutations/use-rename-room.mutation";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function RoomTitle() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room } = useRoom(roomId);
	const renameMutation = useRenameRoomMutation();

	const titleRef = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		if (titleRef.current && titleRef.current.textContent !== room.title) {
			titleRef.current.textContent = room.title;
		}
	}, [room.title]);

	const blurHandler = async () => {
		const titleEl = titleRef.current;
		if (!titleEl) return;

		const newTitle = titleEl.textContent?.trim() ?? "";
		if (newTitle && newTitle !== room.title) {
			renameMutation.mutate({ roomId, newTitle });
		}
	};

	const keyDownHandler: React.KeyboardEventHandler<HTMLHeadingElement> = (
		e,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		}
	};

	return (
		<h1
			className="font-serif text-lg truncate -mx-2 px-2 hover:bg-muted focus-visible:bg-muted rounded-sm outline-none"
			contentEditable
			onBlur={blurHandler}
			onKeyDown={keyDownHandler}
			ref={titleRef}
			suppressContentEditableWarning
		>
			{room.title}
		</h1>
	);
}
