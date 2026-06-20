import { Logo } from "@briom/components/logo";
import { cn } from "@briom/libs/utils";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface ErrorStateProps {
	children?: React.ReactNode;
	className?: string;
	code?: string;
	description?: string;
	message?: string;
	title: string;
}

export function ErrorState({
	code,
	title,
	description,
	children,
	className,
	message,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center",
				className,
			)}
		>
			<Logo className="text-muted-foreground/40" size={36} />

			<div className="flex flex-col gap-2">
				{code && (
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
						{code}
					</p>
				)}
				<h1 className="font-serif text-2xl sm:text-3xl">{title}</h1>
				{description && (
					<p className="max-w-md text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				)}
			</div>

			{message && (
				<Alert className="max-w-md mx-auto" variant="destructive">
					<AlertCircleIcon />
					<AlertTitle>Error Message</AlertTitle>
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			)}

			{children && <div className="flex items-center gap-3">{children}</div>}
		</div>
	);
}
