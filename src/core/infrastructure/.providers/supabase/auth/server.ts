import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description
 * Session-aware Supabase client for use in Server Components, Server
 * Actions, and Route Handlers. Uses the publishable key
 * (`sb_publishable_...`) — the user's session is resolved from
 * request cookies, not from the key itself, so RLS policies still
 * evaluate against `authenticated` for a signed-in user.
 */
export async function createAuthServerClient(): Promise<SupabaseClient>;
export async function createAuthServerClient(
	request: NextRequest,
	response: NextResponse,
): Promise<[SupabaseClient, NextResponse]>;

export async function createAuthServerClient(
	request?: NextRequest,
	response?: NextResponse,
): Promise<SupabaseClient | [SupabaseClient, NextResponse]> {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabasePublishableKey =
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabasePublishableKey) {
		throw new Error(
			"NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required",
		);
	}

	if (!request || !response) {
		const cookieStore = await cookies();
		return createServerClient(supabaseUrl, supabasePublishableKey, {
			cookies: {
				getAll: () => cookieStore.getAll(),
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							void cookieStore.set(name, value, options);
						});
					} catch {}
				},
			},
		});
	}

	let activeResponse = response;
	const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll(cookiesToSet, headers) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});

				activeResponse = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => {
					activeResponse.cookies.set(name, value, options);
				});

				Object.entries(headers).forEach(([key, value]) => {
					activeResponse.headers.set(key, value);
				});
			},
		},
	});

	return [supabase, activeResponse];
}
