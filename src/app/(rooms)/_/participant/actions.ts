"use server";

import { briom } from "@briom";
import type {
	GetParticipantModelsInput,
	GetParticipantModelsOutput,
	InviteParticipantInput,
	InviteParticipantOutput,
} from "@briom/app";
import {
	handleActionError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { getAuthenticatedModerator } from "@briom/supabase/utils/get-authenticated-moderator";
import { revalidatePath } from "next/cache";

export async function getParticipantModels(
	input: GetParticipantModelsInput,
): Promise<ServerActionResult<GetParticipantModelsOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.rooms.participantModels(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function inviteParticipant(
	input: InviteParticipantInput,
): Promise<ServerActionResult<InviteParticipantOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.rooms.inviteParticipant(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath("/rooms", "layout");
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}
