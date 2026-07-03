"use client";

import { ProgressProvider as BProgressProvider } from "@bprogress/next/app";

export function ProgressProvider({ children }: React.PropsWithChildren) {
	return (
		<BProgressProvider
			color="var(--primary)"
			height="4px"
			options={{ showSpinner: false }}
			shallowRouting
		>
			{children}
		</BProgressProvider>
	);
}
