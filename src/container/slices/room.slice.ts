import {
	ConcludeDeliberationHandler,
	DeleteRoomHandler,
	FormRoomHandler,
	InviteParticipantHandler,
	PauseDeliberationHandler,
	RenameRoomHandler,
	ResumeDeliberationHandler,
	StartDeliberationHandler,
} from "@briom/core/application";
import { RoomContext } from "@briom/libs/briom/contexts/room.context";
import { DrizzleRoomRepository } from "@briom/libs/providers/drizzle";

import type { infrastructureSlice } from "./infrastructure.slice";

export const roomSlice = (
	container: ReturnType<typeof infrastructureSlice>,
) => {
	return container
		.add("Repository:Room", (r) => {
			return new DrizzleRoomRepository(r["Client:Database"]);
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
				inviteParticipant: r["Handler:InviteParticipant"],
				pause: r["Handler:PauseDeliberation"],
				rename: r["Handler:RenameRoom"],
				resume: r["Handler:ResumeDeliberation"],
				start: r["Handler:StartDeliberation"],
			});
		});
};
