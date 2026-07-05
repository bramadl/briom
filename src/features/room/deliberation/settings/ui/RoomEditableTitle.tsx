"use client";

import { useRoom } from "@briom/room/hooks/use-room";
import { useCallback, useRef } from "react";

import { useRenameRoomMutation } from "../hooks/use-rename-room-mutation";

const MAX_TITLE_LENGTH = 20;

export function RoomEditableTitle() {
	const { room, roomId } = useRoom();
	const mutation = useRenameRoomMutation(roomId);

	const lastCommittedTitleRef = useRef(room.title);
	const editableRef = useRef<HTMLHeadingElement>(null);

	const constraintLength = useCallback(
		(e: React.InputEvent<HTMLHeadingElement>) => {
			const nativeEvent = e.nativeEvent as InputEvent;

			const isDeletion = nativeEvent.inputType?.startsWith("delete");
			if (isDeletion) return;

			const currentLength = e.currentTarget.textContent?.length ?? 0;
			if (currentLength >= MAX_TITLE_LENGTH) e.preventDefault();
		},
		[],
	);

	const renameTitle = useCallback(
		(e: React.FocusEvent<HTMLHeadingElement>) => {
			const newTitle = e.currentTarget.textContent?.trim() ?? "";

			const isEmpty = !newTitle;
			const isUnchanged =
				!newTitle || newTitle === lastCommittedTitleRef.current;

			if (isEmpty || isUnchanged) {
				if (isEmpty && editableRef.current) {
					editableRef.current.textContent = lastCommittedTitleRef.current;
				}
				return;
			}

			const title = newTitle.slice(0, MAX_TITLE_LENGTH);
			lastCommittedTitleRef.current = title;

			mutation.mutate({ roomId, title });
		},
		[mutation.mutate, roomId],
	);

	const preventNewline = useCallback(
		(e: React.KeyboardEvent<HTMLHeadingElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.currentTarget.blur();
			}
		},
		[],
	);

	return (
		<h1
			className="font-serif text-lg truncate -mx-2 px-2 hover:bg-muted focus-visible:bg-muted rounded-sm outline-none"
			contentEditable
			onBeforeInput={constraintLength}
			onBlur={renameTitle}
			onKeyDown={preventNewline}
			ref={editableRef}
			suppressContentEditableWarning
		>
			{room.title}
		</h1>
	);
}
