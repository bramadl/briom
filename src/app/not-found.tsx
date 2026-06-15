import { AnimatedOrnament } from "@briom/components/animated/ornament";
import { Button } from "@briom/components/ui/button";
import { ErrorState } from "@briom/ui/error-state";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="relative w-full">
			<AnimatedOrnament />
			<ErrorState
				code="404"
				description="The page you're looking for doesn't exist, or may have been moved."
				title="Nothing here"
			>
				<Button asChild>
					<Link href="/">Back to home</Link>
				</Button>
			</ErrorState>
		</div>
	);
}
