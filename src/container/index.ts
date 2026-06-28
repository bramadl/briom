import { Briom } from "@briom/client";
import { ContainerBuilder } from "@briom/drimion";
import { pipe } from "@briom/utils";

import { infrastructureSlice } from "./slices/infrastructure.slice";
import { moderatorSlice } from "./slices/moderator.slice";
import { roomSlice } from "./slices/room.slice";
import { sseSlice } from "./slices/sse.slice";
import { turnSlice } from "./slices/turn.slice";

const container = pipe(
	ContainerBuilder.create(),
	infrastructureSlice,
	sseSlice,
	roomSlice,
	turnSlice,
	moderatorSlice,
)
	.add("briom", (r) => {
		return new Briom({
			moderator: r["Context:Moderator"],
			rooms: r["Context:Room"],
			turns: r["Context:Turn"],
		});
	})
	.build();

export const briom = container.briom;
export type briomClient = typeof briom;

export const sseForwarder = container["Adapter:SseForwarder"];
