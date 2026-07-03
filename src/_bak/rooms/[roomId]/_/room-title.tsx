"use client";

import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useRenameRoomMutation } from "@briom/rooms/_/room/mutations/use-rename-room.mutation";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function RoomTitle() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room } = useRoom(roomId);
	const renameMutation = useRenameRoomMutation();

	const titleRef = useRef<HTMLHeadingElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [localTitle, setLocalTitle] = useState(room.title);

	useEffect(() => {
		if (isEditing) return;
		if (localTitle === room.title) return;

		setLocalTitle(room.title);
		if (titleRef.current) {
			titleRef.current.textContent = room.title;
		}
	}, [room.title, isEditing, localTitle]);

	const handleFocus = useCallback(() => {
		setIsEditing(true);
		setLocalTitle(titleRef.current?.textContent?.trim() ?? room.title);
	}, [room.title]);

	const handleBlur = useCallback(() => {
		setIsEditing(false);

		const titleEl = titleRef.current;
		if (!titleEl) return;

		const newTitle = titleEl.textContent?.trim() ?? "";
		if (newTitle && newTitle !== room.title) {
			renameMutation.mutate({ roomId, newTitle });
			setLocalTitle(newTitle);
		} else if (newTitle !== localTitle) {
			titleEl.textContent = room.title;
			setLocalTitle(room.title);
		}
	}, [room.title, roomId, localTitle, renameMutation]);

	const handleKeyDown: React.KeyboardEventHandler<HTMLHeadingElement> = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		} else if (e.key === "Escape") {
			e.preventDefault();

			if (titleRef.current) {
				titleRef.current.textContent = localTitle;
			}
			setIsEditing(false);
		}
	};

	const handleInput: React.InputEventHandler<HTMLHeadingElement> = (e) => {
		const text = e.currentTarget.textContent?.trim() ?? "";
		setLocalTitle(text);
	};

	return (
		<h1
			className="font-serif text-lg truncate -mx-2 px-2 hover:bg-muted focus-visible:bg-muted rounded-sm outline-none"
			contentEditable
			onBlur={handleBlur}
			onFocus={handleFocus}
			onInput={handleInput}
			onKeyDown={handleKeyDown}
			ref={titleRef}
			suppressContentEditableWarning
		>
			{room.title}
		</h1>
	);
}
