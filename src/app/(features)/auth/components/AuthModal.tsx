"use client";

import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@briom/components/ui/dialog";
import { Input } from "@briom/components/ui/input";
import { createAuthClient } from "@briom/supabase/auth/client";
import { Loader2Icon, MailIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { GoogleIcon } from "./GoogleIcon";

const supabaseClient = createAuthClient();
function getURL() {
	let url =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.NEXT_PUBLIC_VERCEL_URL ??
		"http://localhost:3000";

	url = url.includes("http") ? url : `https://${url}`;
	return url.endsWith("/") ? url.slice(0, -1) : url;
}

type AuthStep = "idle" | "magic-link-sent";
type LoadingSource = "google" | "magic-link" | null;

interface AuthModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function AuthModal({ onOpenChange, open }: AuthModalProps) {
	const [step, setStep] = useState<AuthStep>("idle");
	const [email, setEmail] = useState("");
	const [loadingSource, setLoadingSource] = useState<LoadingSource>(null);

	const handleClose = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				setTimeout(() => {
					setStep("idle");
					setEmail("");
					setLoadingSource(null);
				}, 200);
			}
			onOpenChange(nextOpen);
		},
		[onOpenChange],
	);

	const handleGoogleAuth = useCallback(async () => {
		setLoadingSource("google");
		const { error } = await supabaseClient.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${getURL()}/auth/callback` },
		});

		if (error) {
			toast.error("Google sign in failed", { description: error.message });
			setLoadingSource(null);
		}
	}, []);

	const handleMagicLink = useCallback(async () => {
		const trimmed = email.trim();
		if (!trimmed) return;

		setLoadingSource("magic-link");
		const { error } = await supabaseClient.auth.signInWithOtp({
			email: trimmed,
			options: { emailRedirectTo: `${getURL()}/auth/callback` },
		});
		setLoadingSource(null);

		if (error) {
			toast.error("Failed to send link", { description: error.message });
			return;
		}

		setStep("magic-link-sent");
	}, [email]);

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") handleMagicLink();
	};

	const isGoogleLoading = loadingSource === "google";
	const isMagicLinkLoading = loadingSource === "magic-link";
	const isBusy = loadingSource !== null;

	return (
		<Dialog onOpenChange={handleClose} open={open}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<div className="flex justify-center mb-2">
						<Logo tinted />
					</div>
					<DialogTitle className="text-center font-serif text-xl font-normal">
						{step === "magic-link-sent" ? "Check your email" : "Get started"}
					</DialogTitle>
					<DialogDescription className="text-center text-sm">
						{step === "magic-link-sent"
							? `We sent a sign-in link to ${email}. Click it to continue.`
							: "Sign in to open a room and start a deliberation."}
					</DialogDescription>
				</DialogHeader>

				{step === "idle" && (
					<div className="flex flex-col gap-3 mt-2">
						{/* Google OAuth */}
						<Button
							className="w-full gap-2"
							disabled={isBusy}
							onClick={handleGoogleAuth}
							variant="outline"
						>
							{isGoogleLoading ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : (
								<GoogleIcon />
							)}
							Continue with Google
						</Button>

						<div className="flex items-center gap-3">
							<div className="flex-1 h-px bg-border" />
							<span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
								or
							</span>
							<div className="flex-1 h-px bg-border" />
						</div>

						{/* Magic Link */}
						<div className="flex flex-col gap-2">
							<Input
								disabled={isBusy}
								onChange={(e) => setEmail(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="you@example.com"
								type="email"
								value={email}
							/>
							<Button
								className="w-full gap-2"
								disabled={isBusy || !email.trim()}
								onClick={handleMagicLink}
							>
								{isMagicLinkLoading ? (
									<Loader2Icon className="size-4 animate-spin" />
								) : (
									<MailIcon className="size-4" />
								)}
								Continue with Email
							</Button>
						</div>

						<p className="text-center text-xs text-muted-foreground mt-1">
							No password needed.
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
