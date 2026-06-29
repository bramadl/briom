import {
	type IAttachmentStorage,
	RoomId,
	type RoomRepository,
} from "@briom/domain";
import { type ICommand, type IResult, Result } from "@briom/libs/drimion";

import type { DeleteRoomCommand } from "./command";

/**
 * @description
 * `DeleteRoomHandler` — Command Handler
 *
 * Executes the permanent deletion of a room.
 *
 * **Flow**
 * 1. Find room by ID (idempotent — no error if not found)
 * 2. Call `repository.close()` to remove from persistence
 *
 * **No Events**
 * Unlike other commands, delete does not publish domain events. The room
 * and its history are erased; there is no aggregate left to emit from.
 *
 * **Idempotency**
 * Deleting a non-existent room returns success (no-op). This prevents
 * "already deleted" errors from bubbling to the user.
 *
 * @see RoomRepository.close — for persistence removal
 */
export class DeleteRoomHandler
	implements ICommand<DeleteRoomCommand, void, never>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly attachmentStorage: IAttachmentStorage,
	) {}

	/**
	 * @description
	 * Deletes a room permanently.
	 *
	 * @param command - Room ID to delete
	 * @returns Result containing void (always succeeds)
	 */
	public async execute(
		command: DeleteRoomCommand,
	): Promise<IResult<void, never>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) return Result.success(undefined);

		const results = await Promise.allSettled([
			this.attachmentStorage.deleteRoomFolder(roomId),
			this.roomRepository.close(room),
		]);

		for (const result of results) {
			if (result.status === "rejected") {
				console.warn(
					"[DeleteRoomHandler] Background purge step failed:",
					result.reason,
				);
			}
		}

		return Result.success(undefined);
	}
}
