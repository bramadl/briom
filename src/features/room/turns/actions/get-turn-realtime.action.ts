"use server";

import { getUser } from "@briom/core/infra/auth";
import { turnChannel } from "@briom/inngest/channels/turn.channel";
import { inngest } from "@briom/inngest/client";
import { getClientSubscriptionToken } from "inngest/react";

export async function getTurnRealtimeToken(roomId: string) {
	await getUser();
	return getClientSubscriptionToken(inngest, {
		channel: turnChannel({ roomId }),
		topics: [
			"initiated",
			"streamStarted",
			"tokenAccumulated",
			"settled",
			"failed",
			"abandoned",
		],
	});
}
