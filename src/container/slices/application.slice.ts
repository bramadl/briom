import {
	AddUserMessageHandler,
	CreateRoomHandler,
	GetRoomHandler,
	GetRoomsHandler,
	InviteParticipantHandler,
	RenameRoomHandler,
	RequestParticipantResponseHandler,
} from "@briom/app";

import type { domainSlice } from "./domain.slice";

export const applicationSlice = (container: ReturnType<typeof domainSlice>) => {
	return container
		.add(
			"Command:CreateRoom",
			(r) => new CreateRoomHandler(r["Repository:Room"]),
		)
		.add("Command:InviteParticipant", (r) => {
			return new InviteParticipantHandler(
				r["Repository:Room"],
				r["Repository:Participant"],
			);
		})
		.add("Command:AddUserMessage", (r) => {
			return new AddUserMessageHandler(
				r["Repository:Room"],
				r["Repository:Turn"],
				r["QueryService:TurnSequencer"],
			);
		})
		.add(
			"Command:RenameRoom",
			(r) => new RenameRoomHandler(r["Repository:Room"]),
		)
		.add("Command:RequestParticipantResponse", (r) => {
			return new RequestParticipantResponseHandler(
				r["Service:Orchestrator"],
				r["Repository:Room"],
				r["Repository:Participant"],
				r["Repository:Turn"],
			);
		})
		.add("Query:GetRooms", (r) => {
			return new GetRoomsHandler(r["Client:Database"]);
		})
		.add("Query:GetRoom", (r) => {
			return new GetRoomHandler(r["Client:Database"]);
		});
};
