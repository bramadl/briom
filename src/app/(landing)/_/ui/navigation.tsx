import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import Link from "next/link";

export function Navigation() {
	return (
		<nav className="sticky z-10 top-0 inset-x-0 backdrop-blur-sm border-b border-border/50 bg-background/80">
			<Container>
				<div className="flex items-center justify-between min-h-16">
					<Logo tagline tinted />
					<Button asChild>
						<Link href="/rooms">Get Started</Link>
					</Button>
				</div>
			</Container>
		</nav>
	);
}
