import { createSupabaseServerClient } from "@briom/supabase/server";
import { NextResponse } from "next/server";

/**
 * @description
 * Auth callback route handler.
 *
 * Handles two flows:
 * - **Google OAuth**: Supabase redirects here with `?code=` after Google consent
 * - **Magic Link**: Supabase redirects here with `?code=` after email link clicked
 *
 * Both flows use PKCE — `exchangeCodeForSession` trades the one-time code for
 * a session and writes it to cookies via `createSupabaseServerClient`.
 *
 * After successful exchange → redirect to `/rooms`.
 * On missing code (direct navigation, replay attack) → redirect to `/`.
 */
export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);

	const code = searchParams.get("code");
	if (!code) return NextResponse.redirect(new URL("/", origin));

	const supabase = await createSupabaseServerClient();
	await supabase.auth.exchangeCodeForSession(code);

	return NextResponse.redirect(new URL("/rooms", origin));
}
