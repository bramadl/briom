"use client";

import { useAuthModal } from "@briom/auth/modal/auth-modal-provider";
import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";

export function Navigation() {
	const { openAuth } = useAuthModal();
	return (
		<nav className="sticky z-10 top-0 inset-x-0 backdrop-blur-sm border-b border-border/50 bg-background/80">
			<Container>
				<div className="flex items-center justify-between min-h-16">
					<Logo className="translate-y-1" tagline tinted />
					<Button onClick={openAuth}>Get Started</Button>
				</div>
			</Container>
		</nav>
	);
}
