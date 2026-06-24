"use server";

import { briom } from "@briom";
import type {
	ConcludeDeliberationInput,
	DeleteRoomInput,
	FormRoomInput,
	FormRoomOutput,
	GetRoomInput,
	GetRoomOutput,
	GetRoomsInput,
	GetRoomsOutput,
	RenameRoomInput,
} from "@briom/app";
import {
	internalServerError,
	parseError,
	parseResponse,
	type ServerActionResult,
} from "@briom/libs/server-action";
import { revalidatePath } from "next/cache";

export async function getRooms(
	input: GetRoomsInput,
): Promise<ServerActionResult<GetRoomsOutput>> {
	try {
		const result = await briom.rooms.list(input);
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

export async function getRoom(
	input: GetRoomInput,
): Promise<ServerActionResult<GetRoomOutput>> {
	try {
		const result = await briom.rooms.get(input);
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
