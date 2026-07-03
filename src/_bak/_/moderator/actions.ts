"use server";

import { briom } from "@briom";
import type { GetModeratorUsageOutput } from "@briom/app/bak";
import {
	handleActionError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { getAuthenticatedModerator } from "@briom/supabase";

export async function getModeratorUsage(): Promise<
	ServerActionResult<GetModeratorUsageOutput>
> {
	try {
		const { id: moderatorId } = await getAuthenticatedModerator();
		const result = await briom.moderator.usageLimit({ moderatorId });
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}
