import { GetModeratorUsageHandler } from "@briom/app";
import { ModeratorContext } from "@briom/libs/briom/contexts";
import type { turnSlice } from "./turn.slice";

export const moderatorSlice = (container: ReturnType<typeof turnSlice>) => {
	return container
		.add("Handler:GetModeratorUsage", (r) => {
			return new GetModeratorUsageHandler(
				r["Repository:Usage"],
				r["Policy:TurnLimit"],
			);
		})
		.add("Context:Moderator", (r) => {
			return new ModeratorContext({
				usageLimit: r["Handler:GetModeratorUsage"],
			});
		});
};
