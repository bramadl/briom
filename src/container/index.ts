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
			sendMessage: r["Command:SendMessage"],
			createRoom: r["Command:CreateRoom"],
			deleteRoom: r["Command:DeleteRoom"],
			deleteTurn: r["Command:DeleteTurn"],
			getAvailableModels: r["Query:GetAvailableModels"],
			getRoom: r["Query:GetRoom"],
			getRooms: r["Query:GetRooms"],
			inviteParticipant: r["Command:InviteParticipant"],
			markStreamFailed: r["Command:MarkStreamFailed"],
			renameRoom: r["Command:RenameRoom"],
			streamResponse: r["Command:StreamResponse"],
		});
	})
	.build();

export const briom = container.briom;
export type briomClient = typeof briom;
