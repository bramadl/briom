import { unwrapOrThrow } from "@briom/libs/server-action";
import { initiateTopicTurn } from "@briom/rooms/_/turn/actions";

import { buildModeratorTurnMutation } from "./helpers/build-moderator-turn-mutation";

export const useInitiateTopicTurnMutation = buildModeratorTurnMutation({
	mutationFn: unwrapOrThrow(initiateTopicTurn),
	errorMessage: "Failed to set the topic",
});
