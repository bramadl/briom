import { Logo } from "@briom/components/logo";
import { Container } from "@briom/components/ui/container";
import Link from "next/link";

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border/50">
			<Container className="py-10">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
					<div className="flex flex-col gap-1">
						<Logo className="text-muted-foreground/60" tagline tinted />
						<p className="text-xs text-muted-foreground/40 font-mono">
							The future of thinking tools.
						</p>
					</div>

					<div className="flex flex-col sm:items-end gap-3">
						<nav className="flex items-center gap-5">
							<Link
								className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
								href="/privacy"
							>
								Privacy Policy
							</Link>
							<Link
								className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
								href="/terms"
							>
								Terms of Service
							</Link>
						</nav>
						<p className="text-xs text-muted-foreground/60 font-mono">
							© {year} Briom. All rights reserved.
						</p>
					</div>
				</div>
			</Container>
		</footer>
	);
}
