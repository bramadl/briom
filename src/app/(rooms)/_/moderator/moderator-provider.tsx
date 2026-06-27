"use client";

import { createContext, useContext } from "react";

export interface ModeratorUser {
	avatar: string | null;
	email: string;
	id: string;
	name: string;
}

const ModeratorContext = createContext<ModeratorUser | null>(null);

export function useModerator(): ModeratorUser {
	const ctx = useContext(ModeratorContext);
	if (!ctx)
		throw new Error("useModerator must be used within ModeratorProvider");
	return ctx;
}

export function ModeratorProvider({
	children,
	user,
}: {
	children: React.ReactNode;
	user: ModeratorUser;
}) {
	return (
		<ModeratorContext.Provider value={user}>
			{children}
		</ModeratorContext.Provider>
	);
}
