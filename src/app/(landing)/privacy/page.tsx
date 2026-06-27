import { Logo } from "@briom/components/logo";
import { Container } from "@briom/components/ui/container";
import Link from "next/link";

export const metadata = {
	title: "Privacy Policy — Briom",
	description: "How Briom collects, uses, and protects your information.",
};

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-10">
			<h2 className="font-serif text-xl mb-3 text-foreground">{title}</h2>
			<div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
				{children}
			</div>
		</div>
	);
}

export default function PrivacyPage() {
	return (
		<main className="min-h-svh bg-background">
			{/* minimal nav */}
			<nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
				<Container>
					<div className="flex items-center min-h-16">
						<Link href="/">
							<Logo
								className="translate-y-1 text-muted-foreground/60"
								tagline
								tinted
							/>
						</Link>
					</div>
				</Container>
			</nav>

			<Container className="py-20 max-w-2xl">
				{/* header */}
				<div className="mb-14">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
						Legal
					</p>
					<h1 className="font-serif text-4xl sm:text-5xl leading-tight mb-4">
						Privacy Policy
					</h1>
					<p className="text-sm text-muted-foreground font-mono">
						Last updated: June 2025
					</p>
				</div>

				<div className="prose-briom">
					<Section title="1. Overview">
						<p>
							Briom ("we", "us", "our") is a collaborative AI deliberation
							platform. This Privacy Policy explains what information we collect
							when you use Briom, how we use it, and what choices you have.
						</p>
						<p>
							By using Briom, you agree to the practices described here. If you
							disagree, please discontinue use of the service.
						</p>
					</Section>

					<Section title="2. Information We Collect">
						<p>
							<strong className="text-foreground font-medium">
								Account information.
							</strong>{" "}
							When you sign in with Google OAuth or a magic link, we receive
							your email address and, if provided by Google, your display name
							and profile photo. We store this to identify your account.
						</p>
						<p>
							<strong className="text-foreground font-medium">
								Room and deliberation content.
							</strong>{" "}
							We store the rooms you create, the AI participants you invite, and
							the full deliberation transcripts — including your own turns and
							the AI responses generated within your rooms. This content is
							necessary to provide the service.
						</p>
						<p>
							<strong className="text-foreground font-medium">
								Usage data.
							</strong>{" "}
							We may collect anonymised usage signals (such as feature
							interactions and error logs) to understand how the product is used
							and to fix issues. We do not sell or share this data with third
							parties for advertising purposes.
						</p>
					</Section>

					<Section title="3. How We Use Your Information">
						<p>We use the information we collect to:</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>Authenticate your account and keep your sessions secure.</li>
							<li>
								Store and display your rooms and deliberation history to you.
							</li>
							<li>
								Send AI model requests on your behalf via OpenRouter, using your
								deliberation content as prompt context.
							</li>
							<li>
								Improve the product through aggregated, anonymised usage
								analysis.
							</li>
							<li>Communicate important service updates when necessary.</li>
						</ul>
					</Section>

					<Section title="4. Third-Party Services">
						<p>Briom relies on the following third-party providers:</p>
						<ul className="list-disc pl-5 space-y-2">
							<li>
								<strong className="text-foreground font-medium">
									Supabase
								</strong>{" "}
								— authentication and database hosting. Your account data and
								deliberation content are stored in Supabase's managed
								infrastructure.
							</li>
							<li>
								<strong className="text-foreground font-medium">
									OpenRouter
								</strong>{" "}
								— AI model routing. Your deliberation content is sent to
								OpenRouter to generate AI participant responses. OpenRouter may
								forward requests to underlying model providers (OpenAI,
								Anthropic, Google, etc.) according to their own privacy
								policies.
							</li>
							<li>
								<strong className="text-foreground font-medium">
									Google OAuth
								</strong>{" "}
								— optional sign-in method. If you sign in via Google, Google's
								privacy policy applies to that authentication step.
							</li>
						</ul>
						<p>
							We do not sell your personal data to any third party, and we do
							not use your deliberation content for advertising.
						</p>
					</Section>

					<Section title="5. Data Retention">
						<p>
							We retain your account and deliberation data for as long as your
							account is active. If you wish to delete your account and all
							associated data, contact us at the address below and we will
							process your request within 30 days.
						</p>
					</Section>

					<Section title="6. Security">
						<p>
							We take reasonable technical measures to protect your data,
							including encrypted storage and HTTPS for all data in transit.
							However, no system is completely secure, and we cannot guarantee
							absolute security.
						</p>
					</Section>

					<Section title="7. Children">
						<p>
							Briom is not intended for users under the age of 13. We do not
							knowingly collect personal information from children. If you
							believe a child has provided us with personal information, please
							contact us so we can delete it.
						</p>
					</Section>

					<Section title="8. Your Rights">
						<p>
							Depending on your jurisdiction, you may have the right to access,
							correct, or delete the personal data we hold about you. To
							exercise any of these rights, contact us at the address below.
						</p>
					</Section>

					<Section title="9. Changes to This Policy">
						<p>
							We may update this Privacy Policy as the product evolves. When we
							do, we will update the "Last updated" date above. Continued use of
							Briom after changes constitutes acceptance of the revised policy.
						</p>
					</Section>

					<Section title="10. Contact">
						<p>
							If you have questions about this Privacy Policy or how your data
							is handled, reach us at{" "}
							<a
								className="text-primary underline underline-offset-3 hover:text-primary/80 transition-colors"
								href="mailto:hello@briom.app"
							>
								hello@briom.app
							</a>
							.
						</p>
					</Section>
				</div>

				{/* back link */}
				<div className="mt-16 pt-8 border-t border-border/50 flex items-center gap-4">
					<Link
						className="text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
						href="/"
					>
						← Back to Briom
					</Link>
					<Link
						className="text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
						href="/terms"
					>
						Terms of Service →
					</Link>
				</div>
			</Container>
		</main>
	);
}
