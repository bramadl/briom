"use server";

import { briom } from "@briom";
import type {
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

import type { ServerActionResult } from "./lib/server-action";
import { parseError } from "./lib/server-error.utils";
import { parseResponse } from "./lib/server-response.utils";

// ───── Get Turns ────────────────────────────────────────────────
export async function getTurns(
	input: GetTurnsInput,
): Promise<ServerActionResult<GetTurnsOutput>> {
	const result = await briom.turns.list(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Initiate Topic Turn ────────────────────────
export async function initiateTopicTurn(
	input: InitiateTopicTurnInput,
): Promise<ServerActionResult<InitiateTopicTurnOutput>> {
	const result = await briom.turns.initiateTopicTurn(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Initiate Moderator Turn ────────────────────────
export async function initiateModeratorTurn(
	input: InitiateModeratorTurnInput,
): Promise<ServerActionResult<InitiateModeratorTurnOutput>> {
	const result = await briom.turns.initiateModeratorTurn(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Initiate Participant Turn ────────────────────────
export async function initiateParticipantTurn(
	input: InitiateParticipantTurnInput,
): Promise<ServerActionResult<InitiateParticipantTurnOutput>> {
	const result = await briom.turns.initiateParticipantTurn(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Retry Turn ────────────────────────
export async function retryTurn(
	input: RetryTurnInput,
): Promise<ServerActionResult<RetryTurnOutput>> {
	const result = await briom.turns.retry(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}
