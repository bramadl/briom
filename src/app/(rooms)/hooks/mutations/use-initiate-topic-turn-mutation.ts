"use client";

import { initiateTopicTurn } from "@briom/rooms/api/turn.actions";

import { buildModeratorTurnMutation } from "./helpers/build-moderator-turn-mutation";

export const useInitiateTopicTurnMutation = buildModeratorTurnMutation({
	mutationFn: initiateTopicTurn,
	errorMessage: "Failed to set the topic",
});
