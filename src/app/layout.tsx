import { ThemeProvider } from "@briom/components/theme-provider";
import { TooltipProvider } from "@briom/components/ui/tooltip";
import type { Metadata } from "next";
import { Fraunces, Geist, Space_Mono } from "next/font/google";

import "./globals.css";

const fontSans = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontSerif = Fraunces({
	subsets: ["latin"],
	variable: "--font-serif",
});

const fontMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Briom – The Future of Thinking Tools",
	description:
		"Briom is a collaborative AI discussion workspace where humans and multiple AI models think through ideas together in a shared conversation.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
			lang="en"
			suppressHydrationWarning
		>
			<head>
				<meta content="Briom" name="apple-mobile-web-app-title" />
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<TooltipProvider>{children}</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
