"use client";

import { Button } from "@briom/components/ui/button";
import { ErrorState } from "@briom/ui/error-state";
import Link from "next/link";
import { useEffect, useTransition } from "react";

export default function RoomsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [pending, startTransition] = useTransition();
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
			<Button
				disabled={pending}
				onClick={() => startTransition(reset)}
				variant="outline"
			>
				Try again
			</Button>
			<Button asChild>
				<Link href="/rooms">Back to rooms</Link>
			</Button>
		</ErrorState>
	);
}
