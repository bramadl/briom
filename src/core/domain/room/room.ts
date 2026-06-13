import { Entity, validator as v } from "@briom/drimion";
import { EmptyFieldError } from "@briom/shared/errors";

import type { RoomId } from "./room-id";

interface RoomProps {
	createdAt: Date;
	id: RoomId;
	title: string;
}

export class Room extends Entity<RoomProps> {
	public static isValidProps(props: RoomProps): EmptyFieldError | undefined {
		if (v.string(props.title).isEmpty()) {
			return new EmptyFieldError({ context: Room.name, field: "title" });
		}
	}
}
