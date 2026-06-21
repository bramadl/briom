import { RoomSseSubscriber, TurnSseSubscriber } from "@briom/app";
import {
	DeliberationConcluded,
	DeliberationPaused,
	DeliberationResumed,
	DeliberationStarted,
	ParticipantInvited,
	RoomFormed,
	TurnFailed,
	TurnInitiated,
	TurnRegistered,
	TurnSettled,
	TurnStreamStarted,
	TurnTokenAccumulated,
} from "@briom/domain";
import type { infrastructureSlice } from "./infrastructure.slice";

export const sseSlice = (container: ReturnType<typeof infrastructureSlice>) => {
	return container.registerEvent((resolved) => {
		const eventBus = resolved["Adapter:EventBus"];
		const sseForwarder = resolved["Adapter:SseForwarder"];

		const roomSubscriber = new RoomSseSubscriber(sseForwarder);
		const turnSubscriber = new TurnSseSubscriber(sseForwarder);

		eventBus.subscribe(
			RoomFormed.type,
			roomSubscriber.onRoomFormed.bind(roomSubscriber),
		);

		eventBus.subscribe(
			ParticipantInvited.type,
			roomSubscriber.onParticipantJoined.bind(roomSubscriber),
		);

		eventBus.subscribe(
			DeliberationStarted.type,
			roomSubscriber.onDeliberationStarted.bind(roomSubscriber),
		);

		eventBus.subscribe(
			TurnRegistered.type,
			roomSubscriber.onTurnRegistered.bind(roomSubscriber),
		);

		eventBus.subscribe(
			DeliberationPaused.type,
			roomSubscriber.onDeliberationPaused.bind(roomSubscriber),
		);

		eventBus.subscribe(
			DeliberationResumed.type,
			roomSubscriber.onDeliberationResumed.bind(roomSubscriber),
		);

		eventBus.subscribe(
			DeliberationConcluded.type,
			roomSubscriber.onDeliberationConcluded.bind(roomSubscriber),
		);

		eventBus.subscribe(
			TurnInitiated.type,
			turnSubscriber.onTurnInitiated.bind(turnSubscriber),
		);

		eventBus.subscribe(
			TurnStreamStarted.type,
			turnSubscriber.onTurnStreamStarted.bind(turnSubscriber),
		);

		eventBus.subscribe(
			TurnTokenAccumulated.type,
			turnSubscriber.onTurnTokenAccumulated.bind(turnSubscriber),
		);

		eventBus.subscribe(
			TurnSettled.type,
			turnSubscriber.onTurnSettled.bind(turnSubscriber),
		);

		eventBus.subscribe(
			TurnFailed.type,
			turnSubscriber.onTurnFailed.bind(turnSubscriber),
		);
	});
};
