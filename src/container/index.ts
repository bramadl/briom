import { ContainerBuilder } from "@briom/drimion";
import { pipe } from "@briom/utils";

import { Briom } from "./app/briom";
import { applicationSlice } from "./slices/application.slice";
import { domainSlice } from "./slices/domain.slice";
import { infrastructureSlice } from "./slices/infrastructure.slice";

const container = pipe(
	ContainerBuilder.create(),
	infrastructureSlice,
	domainSlice,
	applicationSlice,
)
	.add("briom", (r) => {
		return new Briom({
			addUserMessage: r["Command:AddUserMessage"],
			createRoom: r["Command:CreateRoom"],
			deleteRoom: r["Command:DeleteRoom"],
			getAvailableModels: r["Query:GetAvailableModels"],
			getRoom: r["Query:GetRoom"],
			getRooms: r["Query:GetRooms"],
			inviteParticipant: r["Command:InviteParticipant"],
			renameRoom: r["Command:RenameRoom"],
			streamParticipantResponse: r["Command:StreamParticipantResponse"],
		});
	})
	.build();

export const briom = container.briom;
export type briomClient = typeof briom;
