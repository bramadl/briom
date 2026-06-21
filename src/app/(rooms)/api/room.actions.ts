"use server";

import { briom } from "@briom";
import type {
	FormRoomInput,
	FormRoomOutput,
	GetParticipantModelsInput,
	GetParticipantModelsOutput,
	GetRoomInput,
	GetRoomOutput,
	GetRoomsInput,
	GetRoomsOutput,
	InviteParticipantInput,
	InviteParticipantOutput,
	RenameRoomInput,
} from "@briom/app";

import type { ServerActionResult } from "./lib/server-action";
import { parseError } from "./lib/server-error.utils";
import { parseResponse } from "./lib/server-response.utils";

// ───── Get Rooms ────────────────────────────────────────────────
export async function getRooms(
	input: GetRoomsInput,
): Promise<ServerActionResult<GetRoomsOutput>> {
	const result = await briom.rooms.list(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Get Participant Models ───────────────────────────────────
export async function getParticipantModels(
	input: GetParticipantModelsInput,
): Promise<ServerActionResult<GetParticipantModelsOutput>> {
	const result = await briom.rooms.participantModels(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Form Room ────────────────────────────────────────────────
export async function formRoom(
	input: FormRoomInput,
): Promise<ServerActionResult<FormRoomOutput>> {
	const result = await briom.rooms.form(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Get Room ────────────────────────────────────────────────
export async function getRoom(
	input: GetRoomInput,
): Promise<ServerActionResult<GetRoomOutput>> {
	const result = await briom.rooms.get(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}

// ───── Rename Room ────────────────────────────────────────────────
export async function renameRoom(
	input: RenameRoomInput,
): Promise<ServerActionResult<void>> {
	const result = await briom.rooms.rename(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(undefined);
}

// ───── Invite Participant ───────────────────────────────────────
export async function inviteParticipant(
	input: InviteParticipantInput,
): Promise<ServerActionResult<InviteParticipantOutput>> {
	const result = await briom.rooms.inviteParticipant(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}
