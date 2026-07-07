import {
	DeliberationConcluded,
	DeliberationStarted,
	RoomFrozen,
	RoomLocked,
	RoomTopicGenerated,
	RoomUnfrozen,
	RoomUnlocked,
	TurnSlotClaimed,
	TurnSlotReleased,
} from "@briom/core/domain";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { roomStreamActions } from "@briom/room/store/room-stream.store";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { createAuthClient } from "@briom/supabase/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const supabaseClient = createAuthClient();

interface RoomScopedPayload {
	roomId: string;
}

interface RoomTopicGeneratedPayload extends RoomScopedPayload {
	topic: string;
}

interface RoomFrozenPayload extends RoomScopedPayload {
	reason: string;
}

interface RoomLockedPayload extends RoomScopedPayload {
	reason: string;
}

export function useRoomSubscriber(params: {
	roomId: string;
	moderatorId: string;
}) {
	const { roomId, moderatorId } = params;

	const queryClient = useQueryClient();
	const allRoomsKey = roomQueryOptions.getRooms().queryKey;
	const roomKey = roomQueryOptions.getRoom(roomId).queryKey;

	// biome-ignore lint/correctness/useExhaustiveDependencies: roomStreamActions is stable, queryClient is stable.
	useEffect(() => {
		const belongsToRoom = (p: RoomScopedPayload) => p.roomId === roomId;
		const roomChannel = supabaseClient.channel(`moderator:${moderatorId}`, {
			config: { private: true },
		});

		roomChannel
			.on(
				"broadcast",
				{ event: RoomTopicGenerated.type },
				({ payload }: { payload: RoomTopicGeneratedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									info: {
										...old.data.room.info,
										topic: payload.topic,
									},
								},
							},
						};
					});

					queryClient.setQueryData(allRoomsKey, (old) => {
						if (!old?.data?.rooms) return old;
						return {
							...old,
							data: {
								...old.data,
								rooms: old.data.rooms.map((r) =>
									r.id === roomId ? { ...r, topic: payload.topic } : r,
								),
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: DeliberationStarted.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									info: {
										...old.data.room.info,
										metadata: {
											...old.data.room.info.metadata,
											status: "deliberating" as const,
										},
									},
								},
							},
						};
					});

					queryClient.setQueryData(allRoomsKey, (old) => {
						if (!old?.data?.rooms) return old;
						return {
							...old,
							data: {
								...old.data,
								rooms: old.data.rooms.map((r) =>
									r.id === roomId
										? { ...r, status: "deliberating" as const }
										: r,
								),
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: DeliberationConcluded.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									info: {
										...old.data.room.info,
										metadata: {
											...old.data.room.info.metadata,
											status: "concluded" as const,
										},
									},
								},
							},
						};
					});

					queryClient.setQueryData(allRoomsKey, (old) => {
						if (!old?.data?.rooms) return old;
						return {
							...old,
							data: {
								...old.data,
								rooms: old.data.rooms.map((r) =>
									r.id === roomId ? { ...r, status: "concluded" as const } : r,
								),
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: RoomFrozen.type },
				({ payload }: { payload: RoomFrozenPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									state: {
										...old.data.room.state,
										kind: "frozen" as const,
										occurredAt: new Date(),
										reason: payload.reason,
									},
								},
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: RoomUnfrozen.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									state: null,
								},
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: RoomLocked.type },
				({ payload }: { payload: RoomLockedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									state: {
										...old.data.room.state,
										kind: "locked" as const,
										occurredAt: new Date(),
										reason: payload.reason,
									},
								},
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: RoomUnlocked.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					queryClient.setQueryData(roomKey, (old) => {
						if (!old?.data.room) return old;
						return {
							...old,
							data: {
								...old.data,
								room: {
									...old.data.room,
									state: null,
								},
							},
						};
					});
				},
			)
			.on(
				"broadcast",
				{ event: TurnSlotClaimed.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					roomStreamActions.setTurnSlotClaimed(true);
				},
			)
			.on(
				"broadcast",
				{ event: TurnSlotReleased.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					roomStreamActions.setTurnSlotClaimed(false);
					turnStreamActions.reset();
					queryClient.invalidateQueries({ queryKey: roomKey, exact: true });
				},
			)
			.subscribe();

		return () => {
			supabaseClient.removeChannel(roomChannel);
			roomStreamActions.reset();
		};
	}, [roomId, moderatorId]);
}
