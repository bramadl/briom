import {
	ModeratorId,
	RoomId,
	type RoomRepository,
	resolveMediaType,
	TurnAttachment,
	TurnId,
	type TurnSequencer,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type {
	InitiateModeratorTurnCommand,
	InitiateModeratorTurnOutput,
} from "./command";

/**
 * @description
 * `InitiateModeratorTurnHandler` — Command Handler
 *
 * Executes the creation of a moderator turn, with optional file attachments.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Verify room is deliberating
 * 3. If attachments present: check room quota via `room.registerAttachment()`
 * 4. Rehydrate `AttachmentInput[]` → `TurnAttachment[]` value objects
 * 5. Generate next sequence number
 * 6. Delegate to `TurnLifecycleOrchestrator.initiateModeratorTurn()`
 * 7. Register turn in room
 * 8. Persist room and turn
 * 9. Publish all domain events
 *
 * **Attachment quota**
 * `room.registerAttachment()` is called before the turn is created. If the
 * room has reached its ceiling (`RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM`),
 * the command fails fast with `MaximumAttachmentsReachedError` and no turn is
 * persisted. This mirrors the optimistic check on the FE (`room.canAttachMore`).
 *
 * **Events Published**
 * - `TurnInitiated` — signals new turn slot
 * - `TurnSettled` — signals moderator content is available (immediate)
 * - `TurnRegistered` — signals room has new turn in history
 *
 * @see TurnLifecycleOrchestrator — for lifecycle coordination
 * @see Room.registerAttachment — for quota enforcement
 * @see RoomAttachmentPolicy — for per-room ceiling
 */
export class InitiateModeratorTurnHandler
	implements
		ICommand<
			InitiateModeratorTurnCommand,
			InitiateModeratorTurnOutput,
			DomainError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: InitiateModeratorTurnCommand,
	): Promise<IResult<InitiateModeratorTurnOutput, DomainError>> {
		const {
			roomId,
			moderatorId,
			content,
			clientTurnId,
			attachments = [],
		} = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InitiateModeratorTurn" }),
			);
		}

		if (!room.isDeliberating) {
			return Result.error(
				new DomainError("Room is not deliberating", {
					context: "InitiateModeratorTurn",
				}),
			);
		}

		if (attachments.length > 0) {
			const quotaResult = room.registerAttachment(attachments.length);
			if (quotaResult.isError()) {
				return Result.error(quotaResult.error());
			}
		}

		const turnAttachments = attachments.map((a) =>
			TurnAttachment.rehydrate({
				name: a.name,
				url: a.url,
				mimeType: a.mimeType,
				mediaType: resolveMediaType(a.mimeType) ?? "text",
				sizeBytes: a.sizeBytes,
				textContent: null,
			}),
		);

		const nextSequence = await this.sequencer.nextPositionInside(room);
		const result = await this.orchestrator.initiateModeratorTurn({
			id: TurnId(),
			roomId: RoomId(roomId),
			sequence: nextSequence,
			moderatorId: ModeratorId(moderatorId),
			content,
			attachments: turnAttachments,
			clientTurnId,
		});

		if (result.isError()) return Result.error(result.error());

		const turn = result.value();
		room.registerTurn(turn.id);

		await this.roomRepository.persist(room);

		const turnEvents = turn.pullEvents();
		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...turnEvents, ...roomEvents]);

		return Result.success({ turnId: turn.id.value() });
	}
}
