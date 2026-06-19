"use client";

import { useProgress } from "@bprogress/next";
import { useEffect } from "react";

export default function RoomPage() {
	const progress = useProgress();
	useEffect(() => {
		if (progress) progress.stop();
	}, [progress]);

	return <div>Room page</div>;
}
