import { ContainerBuilder } from "@briom/drimion";
import {
	DrizzleParticipantRepository,
	DrizzleRoomRepository,
	DrizzleTurnRepository,
	DrizzleTurnSequencer,
} from "@briom/drizzle";
import { db } from "@briom/drizzle/client";
import { OpenRouterLlmGateway } from "@briom/open-router";

const openRouterApiKey = process.env.OPEN_ROUTER_API_KEY;
if (!openRouterApiKey) throw new Error("OPEN_ROUTER_API_KEY is required");

export const infrastructureSlice = ContainerBuilder.create()
	.add("Database", () => db)
	.add("Repository:Room", (r) => {
		return new DrizzleRoomRepository(r.Database);
	})
	.add("Repository:Participant", (r) => {
		return new DrizzleParticipantRepository(r.Database);
	})
	.add("Repository:Turn", (r) => {
		return new DrizzleTurnRepository(r.Database);
	})
	.add("QueryService:TurnSequencer", (r) => {
		return new DrizzleTurnSequencer(r.Database);
	})
	.add("Adapter:LLMGateway", () => {
		return new OpenRouterLlmGateway(openRouterApiKey);
	});
