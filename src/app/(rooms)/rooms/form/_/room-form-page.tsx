"use client";

import { useRouter } from "@bprogress/next/app";
import { useCallback } from "react";

import { RoomForm } from "../../_/room-form/room-form";

export function RoomFormPage() {
	const router = useRouter();

	const handleCancel = useCallback(() => void router.back(), [router]);
	const handleSuccess = useCallback(
		(roomId: string) => void router.replace(`/rooms/${roomId}`),
		[router],
	);

	return <RoomForm onCancel={handleCancel} onSuccess={handleSuccess} />;
}
