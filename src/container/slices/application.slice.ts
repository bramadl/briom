import {
	CreateRoomHandler,
	DeleteRoomHandler,
	GetAvailableModelsHandler,
	GetRoomHandler,
	GetRoomsHandler,
	InviteParticipantHandler,
	RenameRoomHandler,
	SendMessageHandler,
	StreamResponseHandler,
} from "@briom/app";

import type { domainSlice } from "./domain.slice";

const FORCE_FREE_MODELS_ONLY = Boolean(
	process.env.FORCE_FREE_MODELS_ONLY === "true",
);

export const applicationSlice = (container: ReturnType<typeof domainSlice>) => {
	return container
		.add(
			"Command:CreateRoom",
			(r) => new CreateRoomHandler(r["Repository:Room"]),
		)
		.add(
			"Command:DeleteRoom",
			(r) => new DeleteRoomHandler(r["Repository:Room"]),
		)
		.add(
			"Command:InviteParticipant",
			(r) =>
				new InviteParticipantHandler(
					r["Repository:Room"],
					r["Repository:Participant"],
				),
		)
		.add(
			"Command:SendMessage",
			(r) =>
				new SendMessageHandler(
					r["Repository:Room"],
					r["Repository:Turn"],
					r["QueryService:TurnSequencer"],
				),
		)
		.add(
			"Command:RenameRoom",
			(r) => new RenameRoomHandler(r["Repository:Room"]),
		)
		.add(
			"Command:StreamResponse",
			(r) =>
				new StreamResponseHandler(
					r["Service:Orchestrator"],
					r["Repository:Room"],
					r["Repository:Participant"],
					r["Repository:Turn"],
				),
		)
		.add(
			"Query:GetAvailableModels",
			(r) =>
				new GetAvailableModelsHandler(
					r["Client:OpenRouter"],
					FORCE_FREE_MODELS_ONLY,
				),
		)
		.add("Query:GetRooms", (r) => new GetRoomsHandler(r["Client:Database"]))
		.add("Query:GetRoom", (r) => new GetRoomHandler(r["Client:Database"]));
};
