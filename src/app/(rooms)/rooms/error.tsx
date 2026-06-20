"use client";

import { Button } from "@briom/components/ui/button";
import { ErrorState } from "@briom/ui/error-state";
import Link from "next/link";
import { useEffect } from "react";

export default function RoomsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<ErrorState
			code="Error"
			description="Something went wrong loading this room. You can try again, or go back to your rooms."
			message={error.message}
			title="Couldn't load this"
		>
			<Button onClick={reset} variant="outline">
				Try again
			</Button>
			<Button asChild>
				<Link href="/rooms">Back to rooms</Link>
			</Button>
		</ErrorState>
	);
}
