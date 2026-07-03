import {
	type IModeratorRepository,
	Moderator,
	ModeratorId,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type {
	RegisterModeratorCommand,
	RegisterModeratorOutput,
} from "./command";

/**
 * @description
 * Application-layer command handler responsible for registering a new Moderator.
 *
 * Guards against duplicate emails, instantiates the Moderator aggregate,
 * persists it, and publishes domain events.
 */
export class RegisterModeratorHandler
	implements
		ICommand<
			RegisterModeratorCommand,
			RegisterModeratorOutput,
			ApplicationError
		>
{
	public constructor(
		private readonly moderatorRepository: IModeratorRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: RegisterModeratorCommand): Promise<
		IResult<RegisterModeratorOutput, ApplicationError, unknown>
	> {
		const email = input.email;
		const isExists = await this.moderatorRepository.findByEmail(email);
		if (isExists) {
			return Result.error(
				ApplicationError.forbidden("Email already used.").withCode(
					"EMAIL_ALREADY_USED",
				),
			);
		}

		const moderatorId = ModeratorId(input.id);
		const registerResult = Moderator.register({
			avatar: input.avatar,
			email,
			id: moderatorId,
			name: input.name,
		});

		if (registerResult.isError()) {
			const domainError = registerResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		const moderator = registerResult.value();
		await this.moderatorRepository.persist(moderator);

		const events = moderator.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({
			moderatorId: moderator.id.value(),
		} satisfies RegisterModeratorOutput);
	}
}
