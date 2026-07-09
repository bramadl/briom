import { Button } from "./button";

export function Waitlist({
	children,
	...props
}: React.ComponentProps<typeof Button>) {
	return (
		<Button asChild {...props}>
			<a
				href="https://tally.so/r/Bz5WKN"
				rel="noopener nofollow"
				target="_blank"
			>
				Join the Waitlist
			</a>
		</Button>
	);
}
