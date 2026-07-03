import type { RoomDTO } from "../.contracts/room.dto";

/**
 * @description
 * Input for `IGetRoomQuery`.
 */
export interface GetRoomInput {
	/**
	 * @description
	 * The ID of the moderator requesting this resource.
	 *
	 * Used for authorization (Auth-Z) checks.
	 * Format: UUID v4. Used
	 */
	moderatorId: string;

	/**
	 * @description
	 * Room to get.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `IGetRoomQuery`.
 */
export interface GetRoomOutput {
	room: RoomDTO | null;
}

/**
 * @description
 * `IGetRoomQuery` — Application Query Port
 *
 * Returns the complete denormalized view of a room's
 * deliberation in a single round-trip.
 *
 * @see DrizzleGetRoomQuery — infrastructure implementation
 * @see GetRoomHandler — application handler
 */
export interface IGetRoomQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetRoomInput): Promise<GetRoomOutput>;
}

/**
 * @description
 * `GetRoomQuery` — Message class routed through `QueryBus`.
 *
 * Mirrors the Command pattern used across the application layer
 * (`.input` wrapper) so every read and write operation has a single,
 * consistent entry point via `CommandBus`/`QueryBus` — no handler is
 * ever called directly by the facade.
 */
export class GetRoomQuery {
	public constructor(public readonly input: GetRoomInput) {}
}
