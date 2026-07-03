"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { AuthModal } from "./auth-modal";

interface AuthModalContextValue {
	openAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
	const ctx = useContext(AuthModalContext);
	if (!ctx)
		throw new Error("useAuthModal must be used within LandingAuthProvider");
	return ctx;
}

/**
 * @description
 * Client component wrapper for the landing page.
 *
 * Owns the auth modal open/close state and exposes `openAuth` via context.
 * All landing sections that need to trigger auth (Navigation, HeroSection,
 * CtaSection) consume this context instead of receiving props.
 *
 * Kept as a thin provider — no logic beyond toggling the modal.
 */
export function AuthModalProvider({ children }: React.PropsWithChildren) {
	const [open, setOpen] = useState(false);
	const openAuth = useCallback(() => setOpen(true), []);

	return (
		<AuthModalContext.Provider value={{ openAuth }}>
			{children}
			<AuthModal onOpenChange={setOpen} open={open} />
		</AuthModalContext.Provider>
	);
}
