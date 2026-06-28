import {
	AbandonTurnHandler,
	AbortTurnHandler,
	AccumulateTokenHandler,
	FailTurnHandler,
	GetTurnHandler,
	GetTurnProposalsHandler,
	GetTurnsHandler,
	InitiateModeratorTurnHandler,
	InitiateParticipantTurnHandler,
	InitiateTopicTurnHandler,
	RetryTurnHandler,
	SettleTurnHandler,
	StartStreamHandler,
} from "@briom/core/application";
import { TurnContext } from "@briom/libs/briom/contexts";
import {
	DrizzleGetTurnProposalsQuery,
	DrizzleGetTurnQuery,
	DrizzleGetTurnsQuery,
} from "@briom/libs/providers/drizzle";

import type { roomSlice } from "./room.slice";

export const turnSlice = (container: ReturnType<typeof roomSlice>) => {
	return container
		.add("Query:GetTurn", (r) => {
			return new DrizzleGetTurnQuery(r["Client:Database"]);
		})
		.add("Query:GetTurnProposals", (r) => {
			return new DrizzleGetTurnProposalsQuery(
				r["Client:Database"],
				r["Repository:Room"],
				r["Repository:Turn"],
			);
		})
		.add("Query:GetTurns", (r) => {
			return new DrizzleGetTurnsQuery(r["Client:Database"]);
		})
		.add("Handler:AbandonTurn", (r) => {
			return new AbandonTurnHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:AbortTurn", (r) => {
			return new AbortTurnHandler(r["Service:TurnStreaming"]);
		})
		.add("Handler:AccumulateToken", (r) => {
			return new AccumulateTokenHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:FailTurn", (r) => {
			return new FailTurnHandler(r["Orchestrator:TurnLifecycle"]);
		})
		.add("Handler:GetTurn", (r) => {
			return new GetTurnHandler(r["Query:GetTurn"]);
		})
		.add("Handler:GetTurnProposals", (r) => {
			return new GetTurnProposalsHandler(r["Query:GetTurnProposals"]);
		})
		.add("Handler:GetTurns", (r) => {
			return new GetTurnsHandler(r["Query:GetTurns"]);
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
				r["Adapter:EventBus"],
				r["Service:TurnStreaming"],
				r["Repository:Usage"],
				r["Policy:TurnLimit"],
			);
		})
		.add("Handler:InitiateTopicTurn", (r) => {
			return new InitiateTopicTurnHandler(
				r["Repository:Room"],
				r["Adapter:TurnSequencer"],
				r["Orchestrator:TurnLifecycle"],
				r["Adapter:EventBus"],
				r["Adapter:LlmGateway"],
			);
		})
		.add("Handler:RetryTurn", (r) => {
			return new RetryTurnHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["Orchestrator:TurnLifecycle"],
				r["Policy:TranscriptorRenderer"],
				r["Service:TurnStreaming"],
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
				abort: r["Handler:AbortTurn"],
				accumulate: r["Handler:AccumulateToken"],
				fail: r["Handler:FailTurn"],
				get: r["Handler:GetTurn"],
				getProposals: r["Handler:GetTurnProposals"],
				initiateModeratorTurn: r["Handler:InitiateModeratorTurn"],
				initiateParticipantTurn: r["Handler:InitiateParticipantTurn"],
				initiateTopicTurn: r["Handler:InitiateTopicTurn"],
				list: r["Handler:GetTurns"],
				retry: r["Handler:RetryTurn"],
				settle: r["Handler:SettleTurn"],
				stream: r["Handler:StartStream"],
			});
		});
};
