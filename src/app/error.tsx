"use client";

import { AnimatedOrnament } from "@briom/components/animated/ornament";
import { Button } from "@briom/components/ui/button";
import { ErrorState } from "@briom/ui/error-state";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error({ ...error, message: error.message, name: error.name });
	}, [error]);

	return (
		<div className="relative w-full">
			<AnimatedOrnament />
			<ErrorState
				code="Error"
				description="Something went wrong on our end. You can try again, or head back home."
				message={error.message}
				title="Something broke"
			>
				<Button onClick={reset} variant="outline">
					Try again
				</Button>
				<Button asChild>
					<Link href="/">Back to home</Link>
				</Button>
			</ErrorState>
		</div>
	);
}
