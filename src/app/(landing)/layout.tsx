import { AnimatedOrnament } from "@briom/components/animated/ornament";

import { LenisProvider } from "./_/lenis/lenis-provider";

export default function LandingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LenisProvider>
			<div className="relative">
				<AnimatedOrnament />
				{children}
			</div>
		</LenisProvider>
	);
}
