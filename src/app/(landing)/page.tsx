import { Navigation } from "./_/ui/navigation";
import { CtaSection } from "./sections/cta.section";
import { HeroSection } from "./sections/hero.section";
import { HowItWorksSection } from "./sections/how-it-works.section";
import { PrinciplesSection } from "./sections/principles.section";
import { RoomPreviewSection } from "./sections/room-preview.section";

export default function HomePage() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <RoomPreviewSection />
      <HowItWorksSection />
      <PrinciplesSection />
      <CtaSection />
    </main>
  );
}
