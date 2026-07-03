import { createBrowserClient } from "@supabase/ssr";

/**
 * @description
 * Session-aware Supabase client for use in Client Components. Uses the
 * publishable key (`sb_publishable_...`) — safe to expose in the
 * browser bundle. When the user is signed in via Supabase Auth, this
 * client automatically attaches their session JWT, so RLS policies
 * evaluate against the `authenticated` Postgres role rather than
 * `anon`.
 */
export function createAuthClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabasePublishableKey =
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabasePublishableKey) {
		throw new Error(
			"NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required",
		);
	}

	return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
