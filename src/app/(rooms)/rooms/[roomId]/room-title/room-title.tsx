"use client";

import { isServerError } from "@briom/rooms/api/lib/server-action";
import { renameRoom } from "@briom/rooms/api/room.actions";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface RoomTitleProps {
	initialRoomTitle: string;
}

export function RoomTitle({ initialRoomTitle }: RoomTitleProps) {
	const [_, startTransaction] = useTransition();

	const { roomId } = useParams<{ roomId: string }>();
	const [roomTitle, setRoomTitle] = useState(initialRoomTitle);
	const [pendingTitle, setPendingTitle] = useState<string | null>(null);

	useEffect(() => {
		setRoomTitle(initialRoomTitle);
		setPendingTitle(null);
	}, [initialRoomTitle]);

	const handleRename = async (
		newTitle: string,
		element: HTMLHeadingElement,
	) => {
		if (!newTitle.length || newTitle === roomTitle) {
			if (!newTitle.length) element.innerText = roomTitle;
			return;
		}

		setPendingTitle(newTitle);
		startTransaction(async () => {
			const result = await renameRoom({ roomId, newTitle });
			if (isServerError(result)) {
				setPendingTitle(null);
				element.innerText = roomTitle;
				toast.error("Rename failed", { description: result.error.message });
			}
		});
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLHeadingElement> = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const element = e.currentTarget;
			element.blur();
		}
	};

	const handleBlur: React.FocusEventHandler<HTMLHeadingElement> = (e) => {
		const newTitle = e.currentTarget.innerText.trim();
		handleRename(newTitle, e.currentTarget);
	};

	const displayTitle = pendingTitle ?? roomTitle;

	return (
		<div className="flex items-center gap-4">
			<h1
				className="font-serif text-lg truncate -mx-2 px-2 hover:bg-muted focus-visible:bg-muted rounded-sm"
				contentEditable
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				suppressContentEditableWarning
			>
				{displayTitle}
			</h1>
		</div>
	);
}
