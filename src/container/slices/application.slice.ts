import {
	AddUserMessageHandler,
	CreateRoomHandler,
	InviteParticipantHandler,
	RequestParticipantResponseHandler,
} from "@briom/app";

import { domainSlice } from "./domain.slice";

export const applicationSlice = domainSlice
	.add("Command:CreateRoom", (r) => new CreateRoomHandler(r["Repository:Room"]))
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
	.add("Command:RequestParticipantResponse", (r) => {
		return new RequestParticipantResponseHandler(
			r["Service:Orchestrator"],
			r["Repository:Room"],
			r["Repository:Participant"],
			r["Repository:Turn"],
		);
	});
