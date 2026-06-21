"use client";

import { initiateModeratorTurn } from "@briom/rooms/api/turn.actions";

import { buildModeratorTurnMutation } from "./helpers/build-moderator-turn-mutation";

export const useInitiateModeratorTurnMutation = buildModeratorTurnMutation({
	mutationFn: initiateModeratorTurn,
	errorMessage: "Failed to send your perspective",
});
