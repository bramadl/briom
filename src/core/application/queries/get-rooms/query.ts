import type { RoomOverviewDTO } from "../.contracts/room-overview.dto";

/**
 * @description
 * Input for `IGetRoomsQuery`.
 */
export interface GetRoomsInput {
	/**
	 * @description
	 * The ID of the moderator requesting this resource.
	 *
	 * Format: UUID v4. Used for authorization (Auth-Z) checks.
	 */
	moderatorId: string;
}

/**
 * @description
 * Output from `IGetRoomsQuery`.
 */
export interface GetRoomsOutput {
	rooms: RoomOverviewDTO[];
}

/**
 * @description
 * Additional metadata information of the output.
 */
export interface GetRoomsMetadata {
	canOpenMoreRoom: boolean;
	quotaLeft: number;
	total: number;
}

/**
 * @description
 * `IGetRoomsQuery` — Application Query Port
 *
 * Retrieves all rooms in the system with their relations.
 * Read-only, no side effects.
 *
 * @see DrizzleGetRoomsQuery — infrastructure implementation
 * @see GetRoomsHandler — application handler
 */
export interface IGetRoomsQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetRoomsInput): Promise<GetRoomsOutput>;
}

/**
 * @description
 * `GetRoomsQuery` — Message class routed through `QueryBus`.
 *
 * Mirrors the Command pattern used across the application layer
 * (`.input` wrapper) so every read and write operation has a single,
 * consistent entry point via `CommandBus`/`QueryBus`.
 */
export class GetRoomsQuery {
	public constructor(public readonly input: GetRoomsInput) {}
}
