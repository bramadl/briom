import {
	ConcludeDeliberationCommand,
	type ConcludeDeliberationHandler,
	type ConcludeDeliberationInput,
	DeleteRoomCommand,
	type DeleteRoomHandler,
	type DeleteRoomInput,
	FailSynthesisCommand,
	type FailSynthesisHandler,
	type FailSynthesisInput,
	FormRoomCommand,
	type FormRoomHandler,
	type FormRoomInput,
	GenerateSynthesisCommand,
	type GenerateSynthesisHandler,
	type GenerateSynthesisInput,
	type GetParticipantModelsHandler,
	type GetParticipantModelsInput,
	type GetRoomDeliberationHandler,
	type GetRoomDeliberationInput,
	type GetRoomHandler,
	type GetRoomInput,
	type GetRoomsHandler,
	type GetRoomsInput,
	type GetRoomsOverviewHandler,
	type GetRoomsOverviewInput,
	InitiateSynthesisCommand,
	type InitiateSynthesisHandler,
	type InitiateSynthesisInput,
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
	SaveSynthesisCommand,
	type SaveSynthesisHandler,
	type SaveSynthesisInput,
	StartDeliberationCommand,
	type StartDeliberationHandler,
	type StartDeliberationInput,
} from "@briom/core/application";

/**
 * @description
 * `RoomContextDeps` — Dependency Injection Shape
 *
 * All command and query handlers required for room lifecycle operations.
 * Injected via container to enable testability and swappable implementations.
 */
interface RoomContextDeps {
	/**
	 * @description
	 * End deliberation.
	 */
	conclude: ConcludeDeliberationHandler;
	/**
	 * @description
	 * Remove room permanently.
	 */
	delete: DeleteRoomHandler;
	/**
	 * @description
	 * Full denormalized deliberation view for the room page.
	 */
	deliberation: GetRoomDeliberationHandler;
	/**
	 * @description
	 * Mark synthesis as failed.
	 */
	failSynthesis: FailSynthesisHandler;
	/**
	 * @description
	 * Create new room.
	 */
	form: FormRoomHandler;
	/**
	 * @description
	 * Generate synthesis via LLM.
	 */
	generateSynthesis: GenerateSynthesisHandler;
	/**
	 * @description
	 * Get single room.
	 *
	 * @deprecated Use `getDeliberation` for the room page.
	 */
	get: GetRoomHandler;
	/**
	 * @description
	 * Initiate synthesis process.
	 */
	initiateSynthesis: InitiateSynthesisHandler;
	/**
	 * @description
	 * Add AI participant to room.
	 */
	inviteParticipant: InviteParticipantHandler;
	/**
	 * @description
	 * List all rooms.
	 *
	 * @deprecated Use `listOverview` for the sidebar.
	 */
	list: GetRoomsHandler;
	/**
	 * @description
	 * Lightweight room summaries for the sidebar.
	 */
	overview: GetRoomsOverviewHandler;
	/**
	 * @description
	 * List of all provider models.
	 */
	participantModels: GetParticipantModelsHandler;
	/**
	 * @description
	 * Pause deliberation.
	 */
	pause: PauseDeliberationHandler;
	/**
	 * @description
	 * Rename room.
	 */
	rename: RenameRoomHandler;
	/**
	 * @description
	 * Resume paused deliberation.
	 */
	resume: ResumeDeliberationHandler;
	/**
	 * @description
	 * Save completed synthesis.
	 */
	saveSynthesis: SaveSynthesisHandler;
	/**
	 * @description
	 * Start deliberation with topic.
	 */
	start: StartDeliberationHandler;
}

/**
 * @description
 * `RoomContext` — Application Context
 *
 * Facade for all room-related operations. Provides a unified interface
 * that maps to `Briom`'s ubiquitous language while delegating to individual
 * command/query handlers.
 *
 * **Why a Context?**
 * Rather than injecting 10 handlers into a boundary layer (API route),
 * the boundary injects one `RoomContext`. This reduces constructor bloat
 * and provides a discoverable API surface.
 *
 * **Operation Categories**
 * - **Lifecycle**: form, start, pause, resume, conclude, delete
 * - **Mutation**: inviteParticipant, rename
 * - **Query**: get, list
 *
 * **Human-Led Principle**
 * All operations require explicit moderator action. No autonomous
 * transitions — the moderator decides when to start, pause, resume, or end.
 *
 * @example
 * ```typescript
 * const room = await briom.rooms.form({ title: "Strategy", moderatorId: "user-1" });
 *
 * await briom.rooms.inviteParticipant({
 *  roomId: room.roomId,
 *  displayName: "GPT-4",
 *  model: "gpt-4",
 *  provider: "openai"
 * });
 *
 * await briom.rooms.start({ roomId: room.roomId, topic: "Should we pivot?" });
 * ```
 *
 * @see Briom — parent facade
 * @see Room — domain aggregate
 */
export class RoomContext {
	public constructor(private readonly deps: RoomContextDeps) {}

	/**
	 * @description
	 * Ends a deliberation permanently.
	 *
	 * Room transitions to `CONCLUDED`. No further turns can be initiated.
	 *
	 * @param input - Room ID to conclude
	 */
	public async conclude(input: ConcludeDeliberationInput) {
		return this.deps.conclude.execute(new ConcludeDeliberationCommand(input));
	}

	/**
	 * @description
	 * Removes a room and all its data permanently.
	 *
	 * Hard delete — no recovery. Idempotent (no error if room doesn't exist).
	 *
	 * @param input - Room ID to delete
	 */
	public async delete(input: DeleteRoomInput) {
		return this.deps.delete.execute(new DeleteRoomCommand(input));
	}

	/**
	 * @description
	 * Returns the full denormalized deliberation view for the room page.
	 *
	 * Single round-trip replacing the old `get()` + `turns.list()` pattern.
	 * Turns have embedded author display info — no FE join required.
	 *
	 * @param input - Room ID to retrieve
	 */
	public async deliberation(input: GetRoomDeliberationInput) {
		return this.deps.deliberation.execute(input);
	}

	/**
	 * @description
	 * Creates a new room in `FORMING` status.
	 *
	 * The first step in any deliberation. Room awaits participant invitations.
	 *
	 * @param input - Room title and moderator ID
	 */
	public async form(input: FormRoomInput) {
		return this.deps.form.execute(new FormRoomCommand(input));
	}

	/**
	 * @description
	 * Retrieves a single room with all relations.
	 *
	 * @param input - Room ID to retrieve
	 */
	public async get(input: GetRoomInput) {
		return this.deps.get.execute(input);
	}

	/**
	 * @description
	 * Invites an AI participant into a room.
	 *
	 * **MVP Constraint**: Can only invite while room is `FORMING`.
	 * Once deliberation starts, participant roster is frozen.
	 *
	 * @param input - Participant details and target room
	 */
	public async inviteParticipant(input: InviteParticipantInput) {
		return this.deps.inviteParticipant.execute(
			new InviteParticipantCommand(input),
		);
	}

	/**
	 * @description
	 * Lists all rooms with their relations.
	 *
	 * **MVP**: Returns all rooms unfiltered. Future versions may add
	 * pagination, status filters, or moderator-scoped queries.
	 *
	 * @param input - Empty criteria (reserved for future filtering)
	 */
	public async list(input: GetRoomsInput) {
		return this.deps.list.execute(input);
	}

	/**
	 * @description
	 * Lists lightweight room overviews for the sidebar.
	 *
	 * Returns only display-relevant fields — no turns, no synthesis content.
	 * Substantially cheaper than `list()`.
	 *
	 * @param input - Empty criteria (reserved for future filtering)
	 */
	public async overview(input: GetRoomsOverviewInput) {
		return this.deps.overview.execute(input);
	}

	/**
	 * @description
	 * Lists all FREE-only provider models, grouped by the provider.
	 *
	 * **MVP**: Returns all free-only providers unfiltered. Future versions may add
	 * pagination, status filters, or other-scoped queries.
	 *
	 * @param input - Room ID to pause
	 */
	public async participantModels(input: GetParticipantModelsInput) {
		return this.deps.participantModels.execute(input);
	}

	/**
	 * @description
	 * Pauses an active deliberation.
	 *
	 * No new turns can be initiated while paused. Moderator can resume later.
	 *
	 * @param input - Room ID to pause
	 */
	public async pause(input: PauseDeliberationInput) {
		return this.deps.pause.execute(new PauseDeliberationCommand(input));
	}

	/**
	 * @description
	 * Renames a room.
	 *
	 * Purely cosmetic — does not affect deliberation status or participants.
	 *
	 * @param input - Room ID and new title
	 */
	public async rename(input: RenameRoomInput) {
		return this.deps.rename.execute(new RenameRoomCommand(input));
	}

	/**
	 * @description
	 * Resumes a paused deliberation.
	 *
	 * Restores ability to initiate turns.
	 *
	 * @param input - Room ID to resume
	 */
	public async resume(input: ResumeDeliberationInput) {
		return this.deps.resume.execute(new ResumeDeliberationCommand(input));
	}

	/**
	 * @description
	 * Starts deliberation by setting a topic.
	 *
	 * **Point of no return**: Room transitions from `FORMING` to `DELIBERATING`.
	 * Participants cannot be added after this.
	 *
	 * @param input - Room ID and deliberation topic
	 */
	public async start(input: StartDeliberationInput) {
		return this.deps.start.execute(new StartDeliberationCommand(input));
	}

	/**
	 * @description
	 * Initiates the synthesis process for a concluded room.
	 *
	 * Idempotent guard — prevents concurrent synthesis requests.
	 * Room must be in CONCLUDED status.
	 *
	 * @param input - Room ID
	 */
	public async initiateSynthesis(input: InitiateSynthesisInput) {
		return this.deps.initiateSynthesis.execute(
			new InitiateSynthesisCommand(input),
		);
	}

	/**
	 * @description
	 * Generates a synthesis by calling the LLM.
	 *
	 * **Blocking query** — consumes the full LLM stream before returning.
	 * The moderator explicitly chooses which participant's perspective
	 * synthesizes the deliberation.
	 *
	 * @param input - Room ID and participant ID
	 * @returns Synthesis content and author name
	 */
	public async generateSynthesis(input: GenerateSynthesisInput) {
		return this.deps.generateSynthesis.execute(
			new GenerateSynthesisCommand(input),
		);
	}

	/**
	 * @description
	 * Saves a completed synthesis to the room.
	 *
	 * Must be called after `generateSynthesis` succeeds.
	 * Transitions synthesisStatus from "pending" to "completed".
	 *
	 * @param input - Room ID, content, and author
	 */
	public async saveSynthesis(input: SaveSynthesisInput) {
		return this.deps.saveSynthesis.execute(new SaveSynthesisCommand(input));
	}

	/**
	 * @description
	 * Marks an in-flight synthesis as failed.
	 *
	 * Idempotent — safe to call even if no synthesis is in progress.
	 * Used when LLM call fails or times out.
	 *
	 * @param input - Room ID
	 */
	public async failSynthesis(input: FailSynthesisInput) {
		return this.deps.failSynthesis.execute(new FailSynthesisCommand(input));
	}
}
