import {
	AbandonTurnHandler,
	AccumulateTokenHandler,
	FailTurnHandler,
	InitiateModeratorTurnHandler,
	InitiateParticipantTurnHandler,
	RetryTurnHandler,
	SettleTurnHandler,
	StartStreamHandler,
	TurnLifecycleOrchestrator,
} from "@briom/core/application";
import {
	RoomDeliberation,
	TranscriptorRenderer,
	TurnTimeoutPolicy,
} from "@briom/core/domain";
import { TurnContext } from "@briom/libs/briom/contexts/turn.context";
import {
	DrizzleTurnRepository,
	DrizzleTurnSequencer,
} from "@briom/libs/providers/drizzle";

import type { roomSlice } from "./room.slice";

export const turnSlice = (container: ReturnType<typeof roomSlice>) => {
	return container
		.add("Repository:Turn", (r) => {
			return new DrizzleTurnRepository(r["Client:Database"]);
		})
		.add("Adapter:TurnSequencer", (r) => {
			return new DrizzleTurnSequencer(r["Client:Database"]);
		})
		.add("Policy:TurnTimeout", () => {
			return new TurnTimeoutPolicy({
				ms: parseInt(process.env.GLOBAL_TURN_TIMEOUT ?? "60_000", 10),
			});
		})
		.add("Policy:RoomDeliberation", () => {
			return new RoomDeliberation();
		})
		.add("Policy:TranscriptorRenderer", () => {
			return new TranscriptorRenderer();
		})
		.add("Orchestrator:TurnLifecycle", (r) => {
			return new TurnLifecycleOrchestrator(
				r["Adapter:EventBus"],
				r["Repository:Turn"],
				r["Adapter:Scheduler"],
				r["Policy:TurnTimeout"],
			);
		})
		.add("Handler:AbandonTurn", (r) => {
			return new AbandonTurnHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:AccumulateToken", (r) => {
			return new AccumulateTokenHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:FailTurn", (r) => {
			return new FailTurnHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:InitiateModeratorTurn", (r) => {
			return new InitiateModeratorTurnHandler(
				r["Repository:Room"],
				r["Adapter:TurnSequencer"],
				r["Orchestrator:TurnLifecycle"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:InitiateParticipantTurn", (r) => {
			return new InitiateParticipantTurnHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["Adapter:TurnSequencer"],
				r["Orchestrator:TurnLifecycle"],
				r["Policy:RoomDeliberation"],
				r["Policy:TranscriptorRenderer"],
				r["Adapter:LlmGateway"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:RetryTurn", (r) => {
			return new RetryTurnHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["Orchestrator:TurnLifecycle"],
				r["Policy:TranscriptorRenderer"],
				r["Adapter:LlmGateway"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:SettleTurn", (r) => {
			return new SettleTurnHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:StartStream", (r) => {
			return new StartStreamHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Context:Turn", (r) => {
			return new TurnContext({
				abandon: r["Handler:AbandonTurn"],
				accumulate: r["Handler:AccumulateToken"],
				fail: r["Handler:FailTurn"],
				initiateModeratorTurn: r["Handler:InitiateModeratorTurn"],
				initiateParticipantTurn: r["Handler:InitiateParticipantTurn"],
				retry: r["Handler:RetryTurn"],
				settle: r["Handler:SettleTurn"],
				stream: r["Handler:StartStream"],
			});
		});
};
