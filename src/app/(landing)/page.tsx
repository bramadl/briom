import { AuthModalProvider } from "@briom/auth/modal/auth-modal-provider";

import { Footer } from "./_/ui/footer";
import { Navigation } from "./_/ui/navigation";
import { CtaSection } from "./sections/cta.section";
import { DeliberationNotesSection } from "./sections/deliberation-notes.section";
import { HeroSection } from "./sections/hero.section";
import { HowItWorksSection } from "./sections/how-it-works.section";
import { PrinciplesSection } from "./sections/principles.section";
import { ProblemSection } from "./sections/problem.section";
import { RoomPreviewSection } from "./sections/room-preview.section";

export default function HomePage() {
	return (
		<AuthModalProvider>
			<main className="relative">
				<Navigation />
				<HeroSection />
				<ProblemSection />
				<RoomPreviewSection />
				<HowItWorksSection />
				<PrinciplesSection />
				<CtaSection />
				<DeliberationNotesSection />
			</main>
			<Footer />
		</AuthModalProvider>
	);
}
