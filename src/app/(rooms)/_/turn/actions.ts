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
	internalServerError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";

export async function getTurns(
	input: GetTurnsInput,
): Promise<ServerActionResult<GetTurnsOutput>> {
	try {
		const result = await briom.turns.list(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function initiateTopicTurn(
	input: InitiateTopicTurnInput,
): Promise<ServerActionResult<InitiateTopicTurnOutput>> {
	try {
		const result = await briom.turns.initiateTopicTurn(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function initiateModeratorTurn(
	input: InitiateModeratorTurnInput,
): Promise<ServerActionResult<InitiateModeratorTurnOutput>> {
	try {
		const result = await briom.turns.initiateModeratorTurn(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function initiateParticipantTurn(
	input: InitiateParticipantTurnInput,
): Promise<ServerActionResult<InitiateParticipantTurnOutput>> {
	try {
		const result = await briom.turns.initiateParticipantTurn(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function getTurnProposals(
	input: GetTurnProposalsInput,
): Promise<ServerActionResult<GetTurnProposalsOutput>> {
	try {
		const result = await briom.turns.getProposals(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function abortTurn(
	input: AbortTurnInput,
): Promise<ServerActionResult<void>> {
	try {
		const result = await briom.turns.abort(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function retryTurn(
	input: RetryTurnInput,
): Promise<ServerActionResult<RetryTurnOutput>> {
	try {
		const result = await briom.turns.retry(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}
