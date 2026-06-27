import { getSupabaseServerEnvs } from "@briom/libs/get-env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * @description
 * Server-side Supabase client factory using the publishable key.
 *
 * Uses `createServerClient` from `@supabase/ssr` to read/write the auth
 * session from Next.js cookies. Must be called as a function (not a singleton)
 * because `cookies()` is request-scoped and can only be read inside a
 * server component, server action, or route handler.
 *
 * **Usage**
 * ```ts
 * const supabase = await createSupabaseServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 *
 * **Why publishable key (not secret)?**
 * Session validation uses the publishable key — the JWT is verified by
 * Supabase's auth service, not by us. The secret key (`supabaseAdmin`) is
 * reserved for server-only operations that bypass RLS (e.g. Realtime broadcast).
 *
 * @see supabaseAdmin — for RLS-bypassing server operations
 * @see proxy.ts — where this is used for session refresh on every request
 */
export async function createSupabaseServerClient() {
	const { supabasePublishableKey, supabaseUrl } = getSupabaseServerEnvs();

	const cookieStore = await cookies();
	return createServerClient(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll: () => cookieStore.getAll(),
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					cookieStore.set(name, value, options);
				}
			},
		},
	});
}
