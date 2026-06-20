import { RoomSseSubscriber, TurnSseSubscriber } from "@briom/app";
import type { infrastructureSlice } from "./infrastructure.slice";

export const sseSlice = (container: ReturnType<typeof infrastructureSlice>) => {
	return container.registerEvent((resolved) => {
		const eventBus = resolved["Adapter:EventBus"];
		const sseForwarder = resolved["Adapter:SseForwarder"];

		const roomSubscriber = new RoomSseSubscriber(sseForwarder);
		const turnSubscriber = new TurnSseSubscriber(sseForwarder);

		eventBus.subscribe(
			"room:formed",
			roomSubscriber.onRoomFormed.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:participant-invited",
			roomSubscriber.onParticipantInvited.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:deliberation-started",
			roomSubscriber.onDeliberationStarted.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:turn-registered",
			roomSubscriber.onTurnRegistered.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:deliberation-paused",
			roomSubscriber.onDeliberationPaused.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:deliberation-resumed",
			roomSubscriber.onDeliberationResumed.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"room:deliberation-concluded",
			roomSubscriber.onDeliberationConcluded.bind(roomSubscriber),
		);

		eventBus.subscribe(
			"turn:stream-started",
			turnSubscriber.onTurnStreamStarted.bind(turnSubscriber),
		);

		eventBus.subscribe(
			"turn:token-accumulated",
			turnSubscriber.onTurnTokenAccumulated.bind(turnSubscriber),
		);

		eventBus.subscribe(
			"turn:settled",
			turnSubscriber.onTurnSettled.bind(turnSubscriber),
		);

		eventBus.subscribe(
			"turn:failed",
			turnSubscriber.onTurnFailed.bind(turnSubscriber),
		);
	});
};
