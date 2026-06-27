"use client";

import { useAuthModal } from "@briom/auth/modal/auth-modal-provider";
import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import { useState } from "react";

export function Navigation() {
	const { openAuth } = useAuthModal();
	const [isHidden, setIsHidden] = useState(false);
	const hide = () => setIsHidden(true);

	return (
		<nav className="sticky z-10 top-0 inset-x-0 backdrop-blur-sm border-b border-border/50 bg-background/80 flex flex-col">
			<Container>
				<div className="flex items-center justify-between min-h-16">
					<Logo className="translate-y-1" tagline tinted />
					<Button onClick={openAuth}>Get Started</Button>
				</div>
			</Container>
			{!isHidden && (
				<div className="py-2.5 border-t border-border/50 bg-secondary/10">
					<Container className="text-[11px] md:text-xs flex flex-row gap-3 items-start md:items-center justify-between">
						<p className="text-muted-foreground text-left tracking-wide leading-relaxed max-w-3xl">
							✨{" "}
							<strong>
								Briom is currently in its Early Deliberation Phase:
							</strong>{" "}
							As multiple perspectives intersect, subtle inconsistencies may
							occur. Please moderate with intent.
						</p>
						<Button
							className="shrink-0"
							onClick={hide}
							size="xs"
							variant="outline"
						>
							Dismiss
						</Button>
					</Container>
				</div>
			)}
		</nav>
	);
}
