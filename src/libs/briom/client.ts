import type { ModeratorContext, RoomContext, TurnContext } from "./contexts";

/**
 * @description
 * `BriomDeps` — Dependency Injection Shape
 *
 * Briom client requires two contexts: `RoomContext` for room lifecycle
 * and `TurnContext` for turn lifecycle. These are injected via container
 * to enable testability and swappable implementations.
 */
export interface BriomDeps {
	/**
	 * @description
	 * Moderator lifecycle operations (account, billing, usage.).
	 */
	moderator: ModeratorContext;
	/**
	 * @description
	 * Room lifecycle operations (create, invite, start, pause, etc.).
	 */
	rooms: RoomContext;
	/**
	 * @description
	 * Turn lifecycle operations (initiate, stream, settle, fail, etc.).
	 */
	turns: TurnContext;
}

/**
 * @description
 * `Briom` — Application Client Facade
 *
 * The single entry point for all Briom operations. Exposes two contexts
 * that encapsulate the complete MVP feature set:
 *
 * - **rooms**: Room formation, participant invitation, deliberation control
 * - **turns**: Turn initiation, streaming, settlement, failure handling
 *
 * **Why a Facade?**
 * Rather than exposing 20+ individual handlers, Briom provides a unified
 * interface that mirrors the domain's ubiquitous language:
 * - "I want to form a room" → `briom.rooms.form()`
 * - "I want to start a turn" → `briom.turns.initiateParticipantTurn()`
 *
 * **Usage**
 * ```typescript
 * import { briom } from "@briom";
 *
 * // Room lifecycle
 * await briom.rooms.form({ title: "Architecture", moderatorId: "user-1" });
 *
 * await briom.rooms.inviteParticipant({
 *  roomId,
 *  displayName: "Claude",
 *  model: "claude-3.5-sonnet",
 *  provider: "anthropic"
 * });
 *
 * await briom.rooms.start({ roomId, topic: "CQRS vs Event Sourcing" });
 *
 * // Turn lifecycle
 * await briom.turns.initiateModeratorTurn({
 *  roomId,
 *  moderatorId: "user-1",
 *  content: "What do you think?"
 * });
 *
 * await briom.turns.initiateParticipantTurn({
 *  roomId,
 *  participantId: "claude-1",
 *  intent: "respond"
 * });
 * ```
 *
 * @see RoomContext — for room operations
 * @see TurnContext — for turn operations
 * @see container/index.ts — for dependency wiring
 */
export class Briom {
	public constructor(private readonly deps: BriomDeps) {}

	/**
	 * @description
	 * Moderator lifecycle context: account, billing, usage.
	 */
	public get moderator() {
		return this.deps.moderator;
	}

	/**
	 * @description
	 * Room lifecycle context: formation, deliberation control, participant management.
	 */
	public get rooms() {
		return this.deps.rooms;
	}

	/**
	 * @description
	 * Turn lifecycle context: initiation, streaming, settlement, retry.
	 */
	public get turns() {
		return this.deps.turns;
	}
}
