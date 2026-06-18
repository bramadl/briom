import {
	AbandonTurnCommand,
	type AbandonTurnHandler,
	type AbandonTurnInput,
	AccumulateTokenCommand,
	type AccumulateTokenHandler,
	type AccumulateTokenInput,
	FailTurnCommand,
	type FailTurnHandler,
	type FailTurnInput,
	InitiateModeratorTurnCommand,
	type InitiateModeratorTurnHandler,
	type InitiateModeratorTurnInput,
	InitiateParticipantTurnCommand,
	type InitiateParticipantTurnHandler,
	type InitiateParticipantTurnInput,
	RetryTurnCommand,
	type RetryTurnHandler,
	type RetryTurnInput,
	SettleTurnCommand,
	type SettleTurnHandler,
	type SettleTurnInput,
	StartStreamCommand,
	type StartStreamHandler,
	type StartStreamInput,
} from "@briom/core/application";

interface TurnContextDeps {
	abandon: AbandonTurnHandler;
	accumulate: AccumulateTokenHandler;
	fail: FailTurnHandler;
	initiateModeratorTurn: InitiateModeratorTurnHandler;
	initiateParticipantTurn: InitiateParticipantTurnHandler;
	retry: RetryTurnHandler;
	settle: SettleTurnHandler;
	stream: StartStreamHandler;
}

export class TurnContext {
	public constructor(private readonly deps: TurnContextDeps) {}

	/**
	 * Give up on failed turn
	 */
	public async abandon(input: AbandonTurnInput) {
		return this.deps.abandon.execute(new AbandonTurnCommand(input));
	}

	/**
	 * Stream token from LLM
	 */
	public async accumulate(input: AccumulateTokenInput) {
		return this.deps.accumulate.execute(new AccumulateTokenCommand(input));
	}

	/**
	 * Mark turn as failed
	 */
	public async fail(input: FailTurnInput) {
		return this.deps.fail.execute(new FailTurnCommand(input));
	}

	/**
	 * Moderator sends message
	 */
	public async initiateModeratorTurn(input: InitiateModeratorTurnInput) {
		return this.deps.initiateModeratorTurn.execute(
			new InitiateModeratorTurnCommand(input),
		);
	}

	/**
	 * Start AI response
	 */
	public async initiateParticipantTurn(input: InitiateParticipantTurnInput) {
		return this.deps.initiateParticipantTurn.execute(
			new InitiateParticipantTurnCommand(input),
		);
	}

	/**
	 * Retry failed turn
	 */
	public async retry(input: RetryTurnInput) {
		return this.deps.retry.execute(new RetryTurnCommand(input));
	}

	/**
	 * Complete streaming
	 */
	public async settle(input: SettleTurnInput) {
		return this.deps.settle.execute(new SettleTurnCommand(input));
	}

	/**
	 * Begin streaming tokens
	 */
	public async stream(input: StartStreamInput) {
		return this.deps.stream.execute(new StartStreamCommand(input));
	}
}
