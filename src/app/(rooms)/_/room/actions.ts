"use server";

import { briom } from "@briom";
import type {
	ConcludeDeliberationInput,
	DeleteRoomInput,
	FailSynthesisInput,
	FailSynthesisOutput,
	FormRoomInput,
	FormRoomOutput,
	GenerateSynthesisInput,
	GenerateSynthesisOutput,
	GetRoomDeliberationInput,
	GetRoomDeliberationOutput,
	GetRoomsOverviewInput,
	GetRoomsOverviewOutput,
	InitiateSynthesisInput,
	InitiateSynthesisOutput,
	RenameRoomInput,
	SaveSynthesisInput,
	SaveSynthesisOutput,
} from "@briom/app";
import {
	internalServerError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { revalidatePath } from "next/cache";

export async function getRoomsOverview(
	input: GetRoomsOverviewInput,
): Promise<ServerActionResult<GetRoomsOverviewOutput>> {
	try {
		const result = await briom.rooms.overview(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function formRoom(
	input: FormRoomInput,
): Promise<ServerActionResult<FormRoomOutput>> {
	try {
		const result = await briom.rooms.form(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath("/rooms", "layout");
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function getRoomDeliberation(
	input: GetRoomDeliberationInput,
): Promise<ServerActionResult<GetRoomDeliberationOutput>> {
	try {
		const result = await briom.rooms.deliberation(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function renameRoom(
	input: RenameRoomInput,
): Promise<ServerActionResult<void>> {
	try {
		const result = await briom.rooms.rename(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath("/rooms", "layout");
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(undefined);
	} catch (error) {
		return internalServerError(error);
	}
}

export async function concludeRoom(
	input: ConcludeDeliberationInput,
): Promise<ServerActionResult<void>> {
	try {
		const result = await briom.rooms.conclude(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath("/rooms", "layout");
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(undefined);
	} catch (error) {
		return internalServerError(error);
	}
}

export async function closeRoom(
	input: DeleteRoomInput,
): Promise<ServerActionResult<void>> {
	try {
		const result = await briom.rooms.delete(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath("/rooms", "layout");
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(undefined);
	} catch (error) {
		return internalServerError(error);
	}
}

export async function initiateSynthesis(
	input: InitiateSynthesisInput,
): Promise<ServerActionResult<InitiateSynthesisOutput>> {
	try {
		const result = await briom.rooms.initiateSynthesis(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function generateSynthesis(
	input: GenerateSynthesisInput,
): Promise<ServerActionResult<GenerateSynthesisOutput>> {
	try {
		const result = await briom.rooms.generateSynthesis(input);
		if (result.isError()) return parseError(result.error());
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function saveSynthesis(
	input: SaveSynthesisInput,
): Promise<ServerActionResult<SaveSynthesisOutput>> {
	try {
		const result = await briom.rooms.saveSynthesis(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}

export async function failSynthesis(
	input: FailSynthesisInput,
): Promise<ServerActionResult<FailSynthesisOutput>> {
	try {
		const result = await briom.rooms.failSynthesis(input);
		if (result.isError()) return parseError(result.error());
		revalidatePath(`/rooms/${input.roomId}`, "page");
		return parseResponse(result.value());
	} catch (error) {
		return internalServerError(error);
	}
}
