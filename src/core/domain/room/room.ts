import { Entity, validator as v } from "@briom/drimion";

import { EmptyRoomTitleError } from "./errors/empty-room-title.error";
import type { RoomId } from "./room-id";

interface RoomProps {
	createdAt: Date;
	id: RoomId;
	title: string;
}

export class Room extends Entity<RoomProps> {
	public static isValidProps(
		props: RoomProps,
	): EmptyRoomTitleError | undefined {
		if (v.string(props.title).isEmpty()) return new EmptyRoomTitleError();
	}
}
