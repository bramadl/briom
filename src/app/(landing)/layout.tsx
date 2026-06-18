import { AnimatedOrnament } from "@briom/components/animated/ornament";

import { LenisProvider } from "@briom/libs/next/lenis/provider";

export default function LandingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LenisProvider>
			<div className="relative w-full">
				<AnimatedOrnament />
				{children}
			</div>
		</LenisProvider>
	);
}
