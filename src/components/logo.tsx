"use client";

import { cn } from "@briom/libs/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

interface LogoProps extends React.ComponentProps<"svg"> {
	animate?: boolean;
	size?: number;
	tagline?: boolean;
	tinted?: boolean;
	wordmark?: boolean;
}

export function Logo({
	tinted = false,
	wordmark = false,
	tagline = false,
	size = 32,
	animate = false,
	className,
}: LogoProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const markRef = useRef<SVGGElement>(null);
	const polygonRef = useRef<SVGPolygonElement>(null);
	const lineRef = useRef<SVGLineElement>(null);
	const circleRef = useRef<SVGCircleElement>(null);
	const textRef = useRef<SVGTextElement>(null);
	const subTextRef = useRef<SVGTextElement>(null);

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const stroke = "currentColor";
	const fill = tinted ? "currentColor" : "none";
	const fillOpacity = tinted ? 0.1 : 0;

	const prefersReducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const Mark = ({ s = 44 }: { s?: number }) => {
		const cx = s * 0.5;
		const cy = s * 0.5;
		const r = s * 0.43;

		const hex = Array.from({ length: 6 }, (_, i) => {
			const angle = (Math.PI / 180) * (60 * i - 90);
			return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
		});

		const points = hex.map(([x, y]) => `${x},${y}`).join(" ");
		const topY = hex[0][1];
		const bottomY = hex[3][1];
		const handleX = cx + r * 0.32;
		const handleY = cy + r * 0.2;

		return (
			<>
				<polygon
					fill={fill}
					fillOpacity={fillOpacity}
					points={points}
					ref={polygonRef}
					stroke={stroke}
					strokeLinejoin="round"
					strokeWidth={s * 0.034}
				/>
				<line
					opacity={0.4}
					ref={lineRef}
					stroke={stroke}
					strokeWidth={s * 0.022}
					x1={cx}
					x2={cx}
					y1={topY}
					y2={bottomY}
				/>
				<circle
					cx={handleX}
					cy={handleY}
					fill={stroke}
					r={s * 0.05}
					ref={circleRef}
				/>
			</>
		);
	};

	useGSAP(
		() => {
			if (!isClient || !animate) return;

			if (prefersReducedMotion) {
				gsap.to(svgRef.current, { autoAlpha: 1, duration: 0 });
				return;
			}

			const tl = gsap.timeline();

			tl.to(
				svgRef.current,
				{
					autoAlpha: 1,
					duration: 0.8,
					ease: "power2.out",
				},
				0,
			);

			tl.to(
				[polygonRef.current, lineRef.current],
				{
					scale: 1,
					duration: 0.8,
					ease: "back.out(1.2)",
				},
				0,
			);

			tl.to(
				circleRef.current,
				{
					scale: 1,
					duration: 0.5,
					ease: "back.out(1.4)",
				},
				0.2,
			);

			if (textRef.current) {
				tl.to(
					textRef.current,
					{
						y: 0,
						duration: 0.6,
						ease: "power2.out",
					},
					0.4,
				);
			}

			if (subTextRef.current) {
				tl.to(
					subTextRef.current,
					{
						y: 0,
						duration: 0.5,
						ease: "power2.out",
					},
					0.5,
				);
			}

			gsap.to(circleRef.current, {
				r: circleRef.current?.getAttribute("r")
					? parseFloat(circleRef.current.getAttribute("r") as string) * 1.3
					: 1.6,
				duration: 2,
				repeat: -1,
				yoyo: true,
				ease: "bounce.inOut",
				delay: 1.3,
			});

			gsap.to(markRef.current, {
				rotation: 360,
				duration: 20,
				repeat: -1,
				ease: "none",
				delay: 1.3,
				transformOrigin: "50% 50%",
			});
		},
		{
			scope: svgRef,
			dependencies: [tagline, wordmark, size, animate, isClient],
		},
	);

	if (tagline) {
		return (
			<svg
				aria-label="Briom — Think Together"
				className={cn(className, animate && "opacity-0")}
				height={46}
				ref={svgRef}
				role="img"
				style={{ color: "var(--primary)" }}
				viewBox="0 0 192 46"
				width={192}
			>
				<title>Briom — Think Together</title>
				<g ref={markRef}>
					<Mark s={40} />
				</g>
				<text
					fill="var(--foreground)"
					fontFamily="var(--font-serif)"
					fontSize={18}
					fontWeight={400}
					letterSpacing="0.04em"
					ref={textRef}
					x={46}
					y={22}
				>
					Briom
				</text>
				<text
					fill="var(--muted-foreground)"
					fontFamily="var(--font-mono)"
					fontSize={8.5}
					fontWeight={400}
					letterSpacing="0.14em"
					ref={subTextRef}
					x={46}
					y={34}
				>
					THINK TOGETHER
				</text>
			</svg>
		);
	}

	if (wordmark) {
		return (
			<svg
				aria-label="Briom"
				className={cn(className, animate && "opacity-0")}
				height={size}
				ref={svgRef}
				role="img"
				style={{ color: "var(--primary)" }}
				viewBox={`0 0 172 ${size}`}
				width={172}
			>
				<title>Briom</title>
				<g ref={markRef}>
					<Mark s={size} />
				</g>
				<text
					fill="var(--foreground)"
					fontFamily="var(--font-serif)"
					fontSize={size * 0.5}
					fontWeight={400}
					letterSpacing="0.04em"
					ref={textRef}
					x={size + 6}
					y={size * 0.68}
				>
					Briom
				</text>
			</svg>
		);
	}

	return (
		<svg
			aria-label="Briom"
			className={cn(className, animate && "opacity-0")}
			height={size}
			ref={svgRef}
			role="img"
			style={{ color: "var(--primary)" }}
			viewBox={`0 0 ${size} ${size}`}
			width={size}
		>
			<title>Briom</title>
			<g ref={markRef}>
				<Mark s={size} />
			</g>
		</svg>
	);
}
