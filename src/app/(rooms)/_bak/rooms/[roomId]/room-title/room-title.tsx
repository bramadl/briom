"use client";

import { useRenameRoomMutation } from "@briom/rooms/_bak/hooks/mutations";
import { useRoom } from "@briom/rooms/_bak/hooks/store";
import { useEffect, useRef, useState } from "react";

export function RoomTitle() {
	const { roomId, room } = useRoom();
	const renameMutation = useRenameRoomMutation(roomId);

	const titleRef = useRef<HTMLHeadingElement>(null);
	const [isEditing, setIsEditing] = useState(false);

	const handleBlur = () => {
		setIsEditing(false);
		const newTitle = titleRef.current?.textContent?.trim() ?? "";
		if (newTitle && newTitle !== room.title) {
			renameMutation.mutate({ roomId, newTitle });
		}
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLHeadingElement> = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		}
	};

	useEffect(() => {
		if (titleRef.current && !isEditing) {
			titleRef.current.textContent = room.title;
		}
	}, [room.title, isEditing]);

	return (
		<h1
			className="font-serif text-lg truncate -mx-2 px-2 hover:bg-muted focus-visible:bg-muted rounded-sm"
			contentEditable
			onBlur={handleBlur}
			onFocus={() => setIsEditing(true)}
			onKeyDown={handleKeyDown}
			ref={titleRef}
			suppressContentEditableWarning
		>
			{room.title}
		</h1>
	);
}
