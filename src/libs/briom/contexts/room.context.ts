import {
	ConcludeDeliberationCommand,
	type ConcludeDeliberationHandler,
	type ConcludeDeliberationInput,
	DeleteRoomCommand,
	type DeleteRoomHandler,
	type DeleteRoomInput,
	FormRoomCommand,
	type FormRoomHandler,
	type FormRoomInput,
	type GetRoomHandler,
	type GetRoomInput,
	type GetRoomsHandler,
	type GetRoomsInput,
	InviteParticipantCommand,
	type InviteParticipantHandler,
	type InviteParticipantInput,
	PauseDeliberationCommand,
	type PauseDeliberationHandler,
	type PauseDeliberationInput,
	RenameRoomCommand,
	type RenameRoomHandler,
	type RenameRoomInput,
	ResumeDeliberationCommand,
	type ResumeDeliberationHandler,
	type ResumeDeliberationInput,
	StartDeliberationCommand,
	type StartDeliberationHandler,
	type StartDeliberationInput,
} from "@briom/core/application";

interface RoomContextDeps {
	conclude: ConcludeDeliberationHandler;
	delete: DeleteRoomHandler;
	form: FormRoomHandler;
	get: GetRoomHandler;
	inviteParticipant: InviteParticipantHandler;
	list: GetRoomsHandler;
	pause: PauseDeliberationHandler;
	rename: RenameRoomHandler;
	resume: ResumeDeliberationHandler;
	start: StartDeliberationHandler;
}

export class RoomContext {
	public constructor(private readonly deps: RoomContextDeps) {}

	/**
	 * End discussion
	 */
	public async conclude(input: ConcludeDeliberationInput) {
		return this.deps.conclude.execute(new ConcludeDeliberationCommand(input));
	}

	/**
	 * Remove room
	 */
	public async delete(input: DeleteRoomInput) {
		return this.deps.delete.execute(new DeleteRoomCommand(input));
	}

	/**
	 * Create new room
	 */
	public async form(input: FormRoomInput) {
		return this.deps.form.execute(new FormRoomCommand(input));
	}

	/**
	 * Get one single room
	 */
	public async get(input: GetRoomInput) {
		return this.deps.get.execute(input);
	}

	/**
	 * Add AI to room
	 */
	public async inviteParticipant(input: InviteParticipantInput) {
		return this.deps.inviteParticipant.execute(
			new InviteParticipantCommand(input),
		);
	}

	/**
	 * Get list of all rooms
	 */
	public async list(input: GetRoomsInput) {
		return this.deps.list.execute(input);
	}

	/**
	 * Moderator pause
	 */
	public async pause(input: PauseDeliberationInput) {
		return this.deps.pause.execute(new PauseDeliberationCommand(input));
	}

	/**
	 * Change title
	 */
	public async rename(input: RenameRoomInput) {
		return this.deps.rename.execute(new RenameRoomCommand(input));
	}

	/**
	 * Continue paused discussion
	 */
	public async resume(input: ResumeDeliberationInput) {
		return this.deps.resume.execute(new ResumeDeliberationCommand(input));
	}

	/**
	 * Set topic, begin discussion
	 */
	public async start(input: StartDeliberationInput) {
		return this.deps.start.execute(new StartDeliberationCommand(input));
	}
}
