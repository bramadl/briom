import type { ContainerBuilder } from "@briom/drimion";
import {
	DrizzleParticipantRepository,
	DrizzleRoomRepository,
	DrizzleTurnRepository,
	DrizzleTurnSequencer,
} from "@briom/drizzle";
import { db } from "@briom/drizzle/client";
import { OpenRouterLlmGateway } from "@briom/open-router";
import { openRouter } from "@briom/open-router/client";

export const infrastructureSlice = (container: ContainerBuilder) => {
	return container
		.add("Client:Database", () => db)
		.add("Client:OpenRouter", () => openRouter)
		.add("Repository:Room", (r) => {
			return new DrizzleRoomRepository(r["Client:Database"]);
		})
		.add("Repository:Participant", (r) => {
			return new DrizzleParticipantRepository(r["Client:Database"]);
		})
		.add("Repository:Turn", (r) => {
			return new DrizzleTurnRepository(r["Client:Database"]);
		})
		.add("QueryService:TurnSequencer", (r) => {
			return new DrizzleTurnSequencer(r["Client:Database"]);
		})
		.add("Adapter:LLMGateway", (r) => {
			return new OpenRouterLlmGateway(r["Client:OpenRouter"]);
		});
};
