"use server";

import { briom } from "@briom";
import type {
	AbortTurnInput,
	GetTurnProposalsInput,
	GetTurnProposalsOutput,
	GetTurnsInput,
	GetTurnsOutput,
	InitiateModeratorTurnInput,
	InitiateModeratorTurnOutput,
	InitiateParticipantTurnInput,
	InitiateParticipantTurnOutput,
	InitiateTopicTurnInput,
	InitiateTopicTurnOutput,
	RetryTurnInput,
	RetryTurnOutput,
} from "@briom/app";
import {
	handleActionError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { getAuthenticatedModerator } from "@briom/supabase/utils/get-authenticated-moderator";

export const maxDuration = 300;

export async function getTurns(
	input: GetTurnsInput,
): Promise<ServerActionResult<GetTurnsOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.turns.list(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function initiateTopicTurn(
	input: Omit<InitiateTopicTurnInput, "moderatorId">,
): Promise<ServerActionResult<InitiateTopicTurnOutput>> {
	try {
		const { id: moderatorId } = await getAuthenticatedModerator();
		const result = await briom.turns.initiateTopicTurn({
			...input,
			moderatorId,
		});
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function initiateModeratorTurn(
	input: Omit<InitiateModeratorTurnInput, "moderatorId">,
): Promise<ServerActionResult<InitiateModeratorTurnOutput>> {
	try {
		const { id: moderatorId } = await getAuthenticatedModerator();
		const result = await briom.turns.initiateModeratorTurn({
			...input,
			moderatorId,
		});
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function initiateParticipantTurn(
	input: InitiateParticipantTurnInput,
): Promise<ServerActionResult<InitiateParticipantTurnOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.turns.initiateParticipantTurn(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function getTurnProposals(
	input: GetTurnProposalsInput,
): Promise<ServerActionResult<GetTurnProposalsOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.turns.getProposals(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function abortTurn(
	input: AbortTurnInput,
): Promise<ServerActionResult<void>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.turns.abort(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}

export async function retryTurn(
	input: RetryTurnInput,
): Promise<ServerActionResult<RetryTurnOutput>> {
	try {
		await getAuthenticatedModerator();
		const result = await briom.turns.retry(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return handleActionError(error);
	}
}
