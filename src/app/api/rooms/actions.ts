"use server";

import { briom } from "@briom/container";
import type {
	AvailableModelDTO,
	CreateRoomOutput,
	DeleteRoomOutput,
	GetAvailableModelsOutput,
	GetRoomOutput,
	GetRoomsOutput,
	InviteParticipantOutput,
	RenameRoomOutput,
	SendMessageOutput,
} from "@briom/core/application";
import { revalidatePath } from "next/cache";

import { toServerActionError } from "../contracts/errors";
import type { ServerActionResult } from "../contracts/types";

async function revalidateRoomPage(roomId: string) {
	revalidatePath(`/rooms/${roomId}`, "page");
}

async function revalidateRoomsLayout() {
	revalidatePath("/rooms", "layout");
}

export async function createRoom(
	title: string,
	participants?: AvailableModelDTO[],
): Promise<ServerActionResult<CreateRoomOutput>> {
	const roomResult = await briom.createRoom({ title });
	if (roomResult.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(roomResult.error()),
		};
	}

	if (participants) {
		const { roomId } = roomResult.value();
		for (const participant of participants) {
			const inviteResult = await briom.inviteParticipant({
				displayName: participant.displayName,
				model: participant.model,
				provider: participant.provider,
				roomId,
			});
			if (inviteResult.isError()) {
				return {
					success: false,
					data: null,
					error: toServerActionError(inviteResult.error()),
				};
			}
		}
	}

	await revalidateRoomsLayout();
	return { success: true, data: roomResult.value(), error: null };
}

export async function deleteRoom(
	roomId: string,
): Promise<ServerActionResult<DeleteRoomOutput>> {
	const result = await briom.deleteRoom({ roomId });
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	await revalidateRoomsLayout();
	return { success: true, data: result.value(), error: null };
}

export async function getAvailableModels(): Promise<
	ServerActionResult<GetAvailableModelsOutput>
> {
	const result = await briom.getAvailableModels({} as never);
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	return { success: true, data: result.value(), error: null };
}

export async function getRoom(
	roomId: string,
): Promise<ServerActionResult<GetRoomOutput>> {
	const result = await briom.getRoom({ roomId });
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	return { success: true, data: result.value(), error: null };
}

export async function getRooms(): Promise<ServerActionResult<GetRoomsOutput>> {
	const result = await briom.getRooms({} as never);
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	return { success: true, data: result.value(), error: null };
}

export async function inviteParticipant(
	roomId: string,
	provider: string,
	model: string,
	displayName: string,
): Promise<ServerActionResult<InviteParticipantOutput>> {
	const result = await briom.inviteParticipant({
		roomId,
		provider,
		model,
		displayName,
	});

	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	await revalidateRoomPage(roomId);
	return { success: true, data: result.value(), error: null };
}

export async function renameRoom(
	roomId: string,
	title: string,
): Promise<ServerActionResult<RenameRoomOutput>> {
	const result = await briom.renameRoom({ roomId, title });
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	await revalidateRoomsLayout();
	await revalidateRoomPage(roomId);
	return { success: true, data: result.value(), error: null };
}

export async function sendMessage(
	roomId: string,
	content: string,
): Promise<ServerActionResult<SendMessageOutput>> {
	const result = await briom.sendMessage({ roomId, content });
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: toServerActionError(result.error()),
		};
	}

	return { success: true, data: result.value(), error: null };
}
