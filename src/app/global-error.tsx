"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself. Since the root
 * layout may be the thing that failed, this renders its own minimal
 * `<html>`/`<body>` — no fonts, providers, or shared components that
 * might depend on whatever broke.
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body
				style={{
					alignItems: "center",
					background: "#0a0a0a",
					color: "#e5e5e5",
					display: "flex",
					flexDirection: "column",
					fontFamily:
						"ui-sans-serif, system-ui, -apple-system, sans-serif",
					gap: "1.5rem",
					justifyContent: "center",
					minHeight: "100vh",
					padding: "1.5rem",
					textAlign: "center",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<p
						style={{
							color: "#a8a29e",
							fontFamily: "ui-monospace, monospace",
							fontSize: "0.75rem",
							letterSpacing: "0.2em",
							textTransform: "uppercase",
						}}
					>
						Critical Error
					</p>
					<h1 style={{ fontSize: "1.5rem", fontWeight: 400, margin: 0 }}>
						Briom hit a snag
					</h1>
					<p style={{ color: "#a8a29e", fontSize: "0.875rem", maxWidth: "28rem" }}>
						Something went badly wrong loading the app. Please try
						refreshing the page.
					</p>
				</div>
				<button
					onClick={reset}
					style={{
						background: "#c9a24b",
						border: "none",
						borderRadius: "0.5rem",
						color: "#0a0a0a",
						cursor: "pointer",
						fontSize: "0.875rem",
						padding: "0.5rem 1.25rem",
					}}
					type="button"
				>
					Try again
				</button>
			</body>
		</html>
	);
}
