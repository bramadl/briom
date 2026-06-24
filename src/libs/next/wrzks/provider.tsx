import { ThemeProvider as NextThemesProvider } from "@wrksz/themes/next";
import type * as React from "react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider forcedTheme="dark" storage="cookie" {...props}>
			{children}
		</NextThemesProvider>
	);
}
