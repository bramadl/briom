import { ContainerBuilder } from "@briom/drimion";
import { pipe } from "@briom/utils";

import { Briom } from "../libs/briom/briom.client";

import { infrastructureSlice } from "./slices/infrastructure.slice";
import { roomSlice } from "./slices/room.slice";
import { turnSlice } from "./slices/turn.slice";

const container = pipe(
	ContainerBuilder.create(),
	infrastructureSlice,
	roomSlice,
	turnSlice,
)
	.add("briom", (r) => {
		return new Briom({
			rooms: r["Context:Room"],
			turns: r["Context:Turn"],
		});
	})
	.build();

export const briom = container.briom;
export type briomClient = typeof briom;
