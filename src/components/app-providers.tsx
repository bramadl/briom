import { Toaster } from "@briom/components/ui/sonner";
import { TooltipProvider } from "@briom/components/ui/tooltip";
import { ProgressProvider } from "@briom/libs/next/bprogress/provider";
import { QueryProvider } from "@briom/libs/next/tanstack/query/query-provider";
import { ThemeProvider } from "@briom/libs/next/wrzks/provider";

export function AppProviders({ children }: React.PropsWithChildren) {
	return (
		<QueryProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
				enableSystem
			>
				<ProgressProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</ProgressProvider>
				<Toaster />
			</ThemeProvider>
		</QueryProvider>
	);
}
