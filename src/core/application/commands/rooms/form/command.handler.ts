import {
	type IModeratorRepository,
	type IRoomRepository,
	ModeratorId,
	ModeratorPolicy,
	Participant,
	ParticipantId,
	ParticipantModel,
	ParticipantModelAi,
	ParticipantModelProvider,
	Room,
	RoomId,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { FormRoomCommand, FormRoomInput, FormRoomOutput } from "./command";

interface RejectedParticipant {
	displayName: string;
	reason: string;
}

/**
 * @description
 * Application-layer command handler responsible for forming a new Room.
 *
 * Orchestrates the full lifecycle of room formation: validating moderator
 * identity, enforcing business policy constraints, building and deduplicating
 * participants, instantiating the Room aggregate, persisting it, and publishing
 * domain events.
 */
export class FormRoomHandler
	implements ICommand<FormRoomCommand, FormRoomOutput, ApplicationError>
{
	public constructor(
		private readonly moderatorRepository: IModeratorRepository,
		private readonly roomRepository: IRoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: FormRoomCommand): Promise<IResult<FormRoomOutput, ApplicationError>> {
		if (input.participants.length < 1) {
			return Result.error(
				ApplicationError.badRequest(
					"Please invite at least 1 participant.",
				).withCode("MINIMUM_PARTICIPANT_ERROR"),
			);
		}

		const moderatorId = ModeratorId(input.moderatorId);
		const moderator = await this.moderatorRepository.findById(moderatorId);

		if (!moderator) {
			return Result.error(ApplicationError.notFound("Moderator not found"));
		}

		const policy = new ModeratorPolicy(moderator);
		const activeRoomCount = await this.roomRepository.countFor(moderator);

		const canFormRoom = policy.canFormRoom(activeRoomCount);
		if (!canFormRoom) {
			return Result.error(
				ApplicationError.forbidden(
					"You have reached the maximum number of active rooms.",
				).withCode("ROOM_LIMIT_REACHED"),
			);
		}

		const { participants, rejected } = this.buildParticipants(
			input.participants,
		);

		if (participants.length < 1) {
			return Result.error(
				ApplicationError.badRequest(
					"All participants are invalid or duplicated.",
				).withCode("INVALID_PARTICIPANTS_ERROR"),
			);
		}

		if (participants.length > policy.maximumParticipantsPerRoom) {
			return Result.error(
				ApplicationError.forbidden(
					`You can only invite up to ${policy.maximumParticipantsPerRoom} participants per room.`,
				).withCode("PARTICIPANT_LIMIT_REACHED"),
			);
		}

		const roomResult = Room.form({
			id: RoomId(),
			moderatorId,
			participants,
			title: input.title,
		});

		if (roomResult.isError()) {
			const domainError = roomResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		const room = roomResult.value();
		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		const warning = this.formatWarning(rejected);
		return Result.success({
			roomId: room.id.value(),
			...(warning && { warning }),
		});
	}

	/**
	 * @description
	 * Build participants from input, filtering out invalid or duplicated ones.
	 * Tracks rejected entries for FE toast.
	 */
	private buildParticipants(inputs: FormRoomInput["participants"]): {
		participants: Participant[];
		rejected: RejectedParticipant[];
	} {
		const participants: Participant[] = [];
		const rejected: RejectedParticipant[] = [];
		const seenModels = new Set<string>();

		for (const input of inputs) {
			const modelResult = ParticipantModel.create({
				model: ParticipantModelAi(input.model),
				provider: ParticipantModelProvider(input.provider),
			});

			if (modelResult.isError()) {
				rejected.push({
					displayName: input.displayName,
					reason: "invalid model or provider",
				});
				continue;
			}

			const model = modelResult.value();
			const qualified = model.qualify();

			if (seenModels.has(qualified)) {
				rejected.push({
					displayName: input.displayName,
					reason: "duplicate model",
				});
				continue;
			}

			const participantResult = Participant.create({
				displayName: input.displayName,
				id: ParticipantId(),
				model,
			});

			if (participantResult.isError()) {
				rejected.push({
					displayName: input.displayName,
					reason: "invalid display name",
				});
				continue;
			}

			seenModels.add(qualified);
			participants.push(participantResult.value());
		}

		return { participants, rejected };
	}

	/**
	 * @description
	 * Format rejected participants into a single toast message.
	 *
	 * Examples:
	 * - "Claude was not invited due to invalid model or provider."
	 * - "Claude and GPT-4o were not invited due to duplicate model."
	 * - "Claude, GPT-4o, and Gemini were not invited due to invalid model or provider."
	 */
	private formatWarning(rejected: RejectedParticipant[]): string | undefined {
		if (rejected.length === 0) return undefined;

		const byReason = new Map<string, string[]>();
		for (const r of rejected) {
			const names = byReason.get(r.reason) ?? [];
			names.push(r.displayName);
			byReason.set(r.reason, names);
		}

		const segments: string[] = [];
		for (const [reason, names] of byReason) {
			const namesList = this.oxfordComma(names);
			const verb = names.length === 1 ? "was" : "were";
			segments.push(`${namesList} ${verb} not invited due to ${reason}`);
		}

		return `${segments.join("; ")}.`;
	}

	/**
	 * @description
	 * Oxford comma formatter.
	 * ["Claude"] → "Claude"
	 * ["Claude", "GPT-4o"] → "Claude and GPT-4o"
	 * ["Claude", "GPT-4o", "Gemini"] → "Claude, GPT-4o, and Gemini"
	 */
	private oxfordComma(items: string[]): string {
		if (items.length === 1) return items[0];
		if (items.length === 2) return `${items[0]} and ${items[1]}`;
		const last = items[items.length - 1];
		const rest = items.slice(0, -1).join(", ");
		return `${rest}, and ${last}`;
	}
}
