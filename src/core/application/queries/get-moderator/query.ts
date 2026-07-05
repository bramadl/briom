import type { ModeratorDTO } from "../.contracts/moderator.dto";

/**
 * @description
 * Input for `IGetModeratorQuery`.
 */
export interface GetModeratorInput {
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
 * Output from `IGetModeratorQuery`.
 */
export interface GetModeratorOutput {
	moderator: ModeratorDTO | null;
}

/**
 * @description
 * Additional metadata information of the output.
 */
export interface GetModeratorMetadata {
	/**
	 * @description
	 * Limit applied to the current moderator.
	 */
	limit: {
		/**
		 * @description
		 * Total of room this moderator can open.
		 */
		maximumRoom: number;

		/**
		 * @description
		 * How many participants can be invited in single room.
		 */
		maximumParticipantPerRoom: number;

		/**
		 * @description
		 * How many attachments can be uploaded in single room.
		 */
		maximumAttachmentPerRoom: number;
	};
}

/**
 * @description
 * `IGetModeratorQuery` — Application Query Port
 *
 * Retrieve a moderator useful for rendering profile.
 *
 * @see GetModeratorHandler — application handler
 * @see DrizzleGetModeratorQuery — infrastructure implementation
 */
export interface IGetModeratorQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetModeratorInput): Promise<GetModeratorOutput>;
}

/**
 * @description
 * `GetModeratorQuery` — Message class routed through `QueryBus`.
 *
 * Mirrors the Command pattern used across the application layer
 * (`.input` wrapper) so every read and write operation has a single,
 * consistent entry point via `CommandBus`/`QueryBus`.
 */
export class GetModeratorQuery {
	public constructor(public readonly input: GetModeratorInput) {}
}
