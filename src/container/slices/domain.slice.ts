import { Orchestrator } from "@briom/domain";

import type { infrastructureSlice } from "./infrastructure.slice";

export const domainSlice = (
	container: ReturnType<typeof infrastructureSlice>,
) => {
	return container.add("Service:Orchestrator", (r) => {
		return new Orchestrator(
			r["Adapter:LLMGateway"],
			r["QueryService:TurnSequencer"],
		);
	});
};
