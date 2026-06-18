import {
	Participant,
	ParticipantId,
	ParticipantModel,
	ParticipantModelAi,
	ParticipantModelProvider,
	RoomId,
	type RoomRepository,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type {
	InviteParticipantCommand,
	InviteParticipantOutput,
} from "./command";

/**
 * @description
 * `InviteParticipantHandler` — Command Handler
 *
 * Executes the invitation of an AI participant into a room.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Create Participant entity (model + provider + display name)
 * 3. Delegate to `Room.inviteParticipant()` domain method
 * 4. Persist room (cascades to participant)
 * 5. Publish `ParticipantInvited` domain event
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - Room must be in `FORMING` status (enforced by `Room.inviteParticipant`)
 * - Participant ID must not duplicate existing participant (enforced by `Room`)
 * - Participant Model must not duplicate existing participant (enforced by `Room`)
 * - Display name must be non-empty (enforced by `Participant.create`)
 *
 * **Events Published**
 * - `ParticipantInvited` — signals new AI perspective available
 *
 * @see Room.inviteParticipant — for domain rules
 * @see RoomSseSubscriber — for event forwarding
 */
export class InviteParticipantHandler
	implements
		ICommand<InviteParticipantCommand, InviteParticipantOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Invites an AI participant into a room.
	 *
	 * @param command - Participant details and target room
	 * @returns Result containing participantId, or domain error
	 */
	public async execute(
		command: InviteParticipantCommand,
	): Promise<IResult<InviteParticipantOutput, DomainError>> {
		const { roomId, displayName, model, provider } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InviteParticipant" }),
			);
		}

		const participantId = ParticipantId();
		const participantResult = Participant.create({
			id: participantId,
			roomId: RoomId(roomId),
			displayName,
			model: ParticipantModel.create({
				model: ParticipantModelAi(model),
				provider: ParticipantModelProvider(provider),
			}).value(),
		});

		if (participantResult.isError()) {
			return Result.error(participantResult.error());
		}

		const participant = participantResult.value();
		const inviteResult = room.inviteParticipant(participant);
		if (inviteResult.isError()) return Result.error(inviteResult.error());

		await this.roomRepository.persist(room);

		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...roomEvents]);

		return Result.success({ participantId: participantId.value() });
	}
}
