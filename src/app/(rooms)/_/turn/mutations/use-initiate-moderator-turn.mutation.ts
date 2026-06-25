import { initiateModeratorTurn } from "@briom/rooms/_/turn/actions";

import { buildModeratorTurnMutation } from "./helpers/build-moderator-turn-mutation";

export const useInitiateModeratorTurnMutation = buildModeratorTurnMutation({
	mutationFn: initiateModeratorTurn,
	errorMessage: "Failed to send your perspective",
});
