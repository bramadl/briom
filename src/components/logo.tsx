interface LogoProps extends React.ComponentProps<"svg"> {
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
	className,
}: LogoProps) {
	const stroke = "currentColor";
	const fill = tinted ? "currentColor" : "none";
	const fillOpacity = tinted ? 0.1 : 0;

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
					stroke={stroke}
					strokeLinejoin="round"
					strokeWidth={s * 0.034}
				/>
				<line
					opacity={0.4}
					stroke={stroke}
					strokeWidth={s * 0.022}
					x1={cx}
					x2={cx}
					y1={topY}
					y2={bottomY}
				/>
				<circle cx={handleX} cy={handleY} fill={stroke} r={s * 0.05} />
			</>
		);
	};

	if (tagline) {
		return (
			<svg
				aria-label="Briom — Think Together"
				className={className}
				height={46}
				role="img"
				style={{ color: "var(--primary)" }}
				viewBox="0 0 192 46"
				width={192}
			>
				<title>Briom — Think Together</title>
				<g>
					<Mark s={40} />
				</g>
				<text
					fill="var(--foreground)"
					fontFamily="var(--font-serif)"
					fontSize={18}
					fontWeight={400}
					letterSpacing="0.04em"
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
				className={className}
				height={size}
				role="img"
				style={{ color: "var(--primary)" }}
				viewBox={`0 0 172 ${size}`}
				width={172}
			>
				<title>Briom</title>
				<Mark s={size} />
				<text
					fill="var(--foreground)"
					fontFamily="var(--font-serif)"
					fontSize={size * 0.5}
					fontWeight={400}
					letterSpacing="0.04em"
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
			className={className}
			height={size}
			role="img"
			style={{ color: "var(--primary)" }}
			viewBox={`0 0 ${size} ${size}`}
			width={size}
		>
			<title>Briom</title>
			<Mark s={size} />
		</svg>
	);
}
