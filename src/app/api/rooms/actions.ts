"use server";

import { briom } from "@briom/container";
import type {
	AddUserMessageOutput,
	AvailableModelDTO,
	CreateRoomOutput,
	GetAvailableModelsOutput,
	GetRoomOutput,
	GetRoomsOutput,
	InviteParticipantOutput,
	RenameRoomOutput,
} from "@briom/core/application";
import { revalidatePath } from "next/cache";

export type ServerActionResult<T> =
	| { success: true; data: T; error: null }
	| {
			success: false;
			data: null;
			error: { type: string; message: string };
	  };

export async function revalidateRoomPath(roomId: string) {
	revalidatePath(`/rooms/${roomId}`, "page");
}

export async function revalidateRoomsPath() {
	revalidatePath("/rooms", "layout");
}

export async function addUserMessage(
	roomId: string,
	content: string,
): Promise<ServerActionResult<AddUserMessageOutput>> {
	const result = await briom.addUserMessage({ roomId, content });
	if (result.isError()) {
		return {
			success: false,
			data: null,
			error: {
				type: result.error().name,
				message: result.error().message,
			},
		};
	}

	return { success: true, data: result.value(), error: null };
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
			error: {
				type: roomResult.error().name,
				message: roomResult.error().message,
			},
		};
	}

	if (participants) {
		const room = roomResult.value();
		const roomId = room.roomId;

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
					error: {
						type: inviteResult.error().name,
						message: inviteResult.error().message,
					},
				};
			}
		}
	}

	await revalidateRoomsPath();
	return { success: true, data: roomResult.value(), error: null };
}

export async function getAvailableModels(): Promise<
	ServerActionResult<GetAvailableModelsOutput>
> {
	const result = await briom.getAvailableModels({} as never);
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
			error: {
				type: result.error().name,
				message: result.error().message,
			},
		};
	}
	return { success: true, data: result.value(), error: null };
}

export async function getRooms(): Promise<ServerActionResult<GetRoomsOutput>> {
	const result = await briom.getRooms({} as never);
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
			error: { type: result.error().name, message: result.error().message },
		};
	}

	await revalidateRoomPath(roomId);
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
			error: { type: result.error().name, message: result.error().message },
		};
	}

	await revalidateRoomsPath();
	await revalidateRoomPath(roomId);
	return { success: true, data: result.value(), error: null };
}
