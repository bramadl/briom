import {
	ConcludeDeliberationHandler,
	DeleteRoomHandler,
	FormRoomHandler,
	GetParticipantModelsHandler,
	GetRoomHandler,
	GetRoomsHandler,
	InviteParticipantHandler,
	PauseDeliberationHandler,
	RenameRoomHandler,
	ResumeDeliberationHandler,
	StartDeliberationHandler,
} from "@briom/core/application";
import { RoomContext } from "@briom/libs/briom/contexts";
import {
	DrizzleGetRoomQuery,
	DrizzleGetRoomsQuery,
	DrizzleRoomRepository,
} from "@briom/libs/providers/drizzle";
import { OpenRouterGetParticipantModelsQuery } from "@briom/libs/providers/open-router";

import type { infrastructureSlice } from "./infrastructure.slice";

export const roomSlice = (
	container: ReturnType<typeof infrastructureSlice>,
) => {
	const USE_FREE_MODELS = process.env.USE_FREE_MODELS === "true";
	return container
		.add("Repository:Room", (r) => {
			return new DrizzleRoomRepository(r["Client:Database"]);
		})
		.add("Query:GetRoom", (r) => {
			return new DrizzleGetRoomQuery(r["Client:Database"]);
		})
		.add("Query:GetRooms", (r) => {
			return new DrizzleGetRoomsQuery(r["Client:Database"]);
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
		.add("Handler:GetRoom", (r) => {
			return new GetRoomHandler(r["Query:GetRoom"]);
		})
		.add("Handler:GetRooms", (r) => {
			return new GetRoomsHandler(r["Query:GetRooms"]);
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
		.add("Context:Room", (r) => {
			return new RoomContext({
				conclude: r["Handler:ConcludeDeliberation"],
				delete: r["Handler:DeleteRoom"],
				form: r["Handler:FormRoom"],
				get: r["Handler:GetRoom"],
				inviteParticipant: r["Handler:InviteParticipant"],
				list: r["Handler:GetRooms"],
				pause: r["Handler:PauseDeliberation"],
				participantModels: r["Handler:GetParticipantModels"],
				rename: r["Handler:RenameRoom"],
				resume: r["Handler:ResumeDeliberation"],
				start: r["Handler:StartDeliberation"],
			});
		});
};
