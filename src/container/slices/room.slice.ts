import {
	ConcludeDeliberationHandler,
	DeleteRoomHandler,
	FailSynthesisHandler,
	FormRoomHandler,
	GenerateSynthesisHandler,
	GetParticipantModelsHandler,
	GetRoomDeliberationHandler,
	GetRoomHandler,
	GetRoomsHandler,
	GetRoomsOverviewHandler,
	InitiateSynthesisHandler,
	InviteParticipantHandler,
	PauseDeliberationHandler,
	RenameRoomHandler,
	ResumeDeliberationHandler,
	SaveSynthesisHandler,
	StartDeliberationHandler,
} from "@briom/core/application";
import { RoomContext } from "@briom/libs/briom/contexts";
import {
	DrizzleGetRoomDeliberationQuery,
	DrizzleGetRoomQuery,
	DrizzleGetRoomsOverviewQuery,
	DrizzleGetRoomsQuery,
} from "@briom/libs/providers/drizzle";
import { OpenRouterGetParticipantModelsQuery } from "@briom/libs/providers/open-router";

import type { infrastructureSlice } from "./infrastructure.slice";

export const roomSlice = (
	container: ReturnType<typeof infrastructureSlice>,
) => {
	const USE_FREE_MODELS = process.env.USE_FREE_MODELS === "true";
	return container
		.add("Query:GetRoom", (r) => {
			return new DrizzleGetRoomQuery(r["Client:Database"]);
		})
		.add("Query:GetRoomDeliberation", (r) => {
			return new DrizzleGetRoomDeliberationQuery(r["Client:Database"]);
		})
		.add("Query:GetRooms", (r) => {
			return new DrizzleGetRoomsQuery(r["Client:Database"]);
		})
		.add("Query:GetRoomsOverview", (r) => {
			return new DrizzleGetRoomsOverviewQuery(r["Client:Database"]);
		})
		.add("Query:GetParticipantModels", (r) => {
			return new OpenRouterGetParticipantModelsQuery(r["Client:OpenRouter"]);
		})
		.add("Handler:ConcludeDeliberation", (r) => {
			return new ConcludeDeliberationHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:DeleteRoom", (r) => {
			return new DeleteRoomHandler(r["Repository:Room"]);
		})
		.add("Handler:GetRoomDeliberation", (r) => {
			return new GetRoomDeliberationHandler(r["Query:GetRoomDeliberation"]);
		})
		.add("Handler:GetRoom", (r) => {
			return new GetRoomHandler(r["Query:GetRoom"]);
		})
		.add("Handler:GetRooms", (r) => {
			return new GetRoomsHandler(r["Query:GetRooms"]);
		})
		.add("Handler:GetRoomsOverview", (r) => {
			return new GetRoomsOverviewHandler(r["Query:GetRoomsOverview"]);
		})
		.add("Handler:GetParticipantModels", (r) => {
			return new GetParticipantModelsHandler(
				r["Query:GetParticipantModels"],
				USE_FREE_MODELS,
			);
		})
		.add("Handler:FormRoom", (r) => {
			return new FormRoomHandler(r["Repository:Room"], r["Adapter:EventBus"]);
		})
		.add("Handler:InviteParticipant", (r) => {
			return new InviteParticipantHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:PauseDeliberation", (r) => {
			return new PauseDeliberationHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:RenameRoom", (r) => {
			return new RenameRoomHandler(r["Repository:Room"], r["Adapter:EventBus"]);
		})
		.add("Handler:ResumeDeliberation", (r) => {
			return new ResumeDeliberationHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:StartDeliberation", (r) => {
			return new StartDeliberationHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:GenerateSynthesis", (r) => {
			return new GenerateSynthesisHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["Adapter:LlmGateway"],
				r["Policy:TranscriptorRenderer"],
			);
		})
		.add("Handler:InitiateSynthesis", (r) => {
			return new InitiateSynthesisHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:SaveSynthesis", (r) => {
			return new SaveSynthesisHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Handler:FailSynthesis", (r) => {
			return new FailSynthesisHandler(
				r["Repository:Room"],
				r["Adapter:EventBus"],
			);
		})
		.add("Context:Room", (r) => {
			return new RoomContext({
				conclude: r["Handler:ConcludeDeliberation"],
				delete: r["Handler:DeleteRoom"],
				deliberation: r["Handler:GetRoomDeliberation"],
				failSynthesis: r["Handler:FailSynthesis"],
				form: r["Handler:FormRoom"],
				generateSynthesis: r["Handler:GenerateSynthesis"],
				get: r["Handler:GetRoom"],
				initiateSynthesis: r["Handler:InitiateSynthesis"],
				inviteParticipant: r["Handler:InviteParticipant"],
				list: r["Handler:GetRooms"],
				overview: r["Handler:GetRoomsOverview"],
				pause: r["Handler:PauseDeliberation"],
				participantModels: r["Handler:GetParticipantModels"],
				rename: r["Handler:RenameRoom"],
				resume: r["Handler:ResumeDeliberation"],
				saveSynthesis: r["Handler:SaveSynthesis"],
				start: r["Handler:StartDeliberation"],
			});
		});
};
