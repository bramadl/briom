"use client";

import { useRouter } from "@bprogress/next/app";
import { createAuthClient } from "@briom/supabase/auth/client";
import { useCallback, useTransition } from "react";

const supabaseClient = createAuthClient();

export function useLogout() {
	const router = useRouter();
	const [transitioning, startTransition] = useTransition();

	const logout = useCallback(() => {
		startTransition(async () => {
			await supabaseClient.auth.signOut();
			router.push("/");
		});
	}, [router]);

	return [transitioning, logout] as const;
}
