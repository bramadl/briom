import {
	CreateRoomHandler,
	DeleteRoomHandler,
	DeleteTurnHandler,
	GetAvailableModelsHandler,
	GetRoomHandler,
	GetRoomsHandler,
	InviteParticipantHandler,
	MarkStreamFailedHandler,
	RenameRoomHandler,
	SendMessageHandler,
	StreamResponseHandler,
} from "@briom/app";

import type { domainSlice } from "./domain.slice";

const USE_FREE_MODELS = Boolean(process.env.USE_FREE_MODELS === "true");

export const applicationSlice = (container: ReturnType<typeof domainSlice>) => {
	return container
		.add("Query:GetRooms", (r) => {
			return new GetRoomsHandler(r["Client:Database"]);
		})
		.add("Query:GetRoom", (r) => {
			return new GetRoomHandler(r["Client:Database"]);
		})
		.add("Command:CreateRoom", (r) => {
			return new CreateRoomHandler(r["Repository:Room"]);
		})
		.add("Command:DeleteRoom", (r) => {
			return new DeleteRoomHandler(r["Repository:Room"]);
		})
		.add("Command:DeleteTurn", (r) => {
			return new DeleteTurnHandler(r["Repository:Turn"]);
		})
		.add("Command:RenameRoom", (r) => {
			return new RenameRoomHandler(r["Repository:Room"]);
		})
		.add("Command:InviteParticipant", (r) => {
			return new InviteParticipantHandler(
				r["Repository:Room"],
				r["Repository:Participant"],
			);
		})
		.add("Command:SendMessage", (r) => {
			return new SendMessageHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["QueryService:TurnSequencer"],
			);
		})
		.add("Command:StreamResponse", (r) => {
			return new StreamResponseHandler(
				r["Service:Orchestrator"],
				r["Repository:Room"],
				r["Repository:Participant"],
				r["Repository:Turn"],
				r["QueryService:TurnSequencer"],
			);
		})
		.add("Command:MarkStreamFailed", (r) => {
			return new MarkStreamFailedHandler(r["Repository:Turn"]);
		})
		.add("Query:GetAvailableModels", (r) => {
			return new GetAvailableModelsHandler(
				r["Client:OpenRouter"],
				USE_FREE_MODELS,
			);
		});
};
