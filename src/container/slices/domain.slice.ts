import { Orchestrator } from "@briom/domain";

import { infrastructureSlice } from "./infrastructure.slice";

export const domainSlice = infrastructureSlice.add(
	"Service:Orchestrator",
	(r) => {
		return new Orchestrator(
			r["Adapter:LLMGateway"],
			r["QueryService:TurnSequencer"],
		);
	},
);
