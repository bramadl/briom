import { unwrapOrThrow } from "@briom/libs/server-action";
import { initiateModeratorTurn } from "@briom/rooms/_/turn/actions";

import { buildModeratorTurnMutation } from "./helpers/build-moderator-turn-mutation";

export const useInitiateModeratorTurnMutation = buildModeratorTurnMutation({
	mutationFn: unwrapOrThrow(initiateModeratorTurn),
	errorMessage: "Failed to send your perspective",
});
