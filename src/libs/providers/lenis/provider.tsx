"use client";

import gsap from "gsap";
import type { LenisRef } from "lenis/react";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export function LenisProvider({
	children,
	root = true,
}: {
	children: React.ReactNode;
	root?: boolean;
}) {
	const lenisRef = useRef<LenisRef>(null);
	useEffect(() => {
		function update(time: number) {
			lenisRef.current?.lenis?.raf(time * 1000);
		}

		gsap.ticker.add(update);
		return () => gsap.ticker.remove(update);
	}, []);

	return (
		<ReactLenis
			options={{
				autoRaf: false,
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
				smoothWheel: true,
			}}
			ref={lenisRef}
			root={root}
		>
			{children}
		</ReactLenis>
	);
}
