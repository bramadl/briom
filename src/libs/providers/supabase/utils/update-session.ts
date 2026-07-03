import { getSupabaseServerEnvs } from "@briom/libs/get-env";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const { supabasePublishableKey, supabaseUrl } = getSupabaseServerEnvs();

interface SessionConfig {
	protectedRoute: string;
	publicRoute?: string;
}

export async function updateSession(
	request: NextRequest,
	{ protectedRoute, publicRoute = "/" }: SessionConfig,
) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll(cookiesToSet, headers) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});

				supabaseResponse = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => {
					supabaseResponse.cookies.set(name, value, options);
				});

				Object.entries(headers).forEach(([key, value]) => {
					supabaseResponse.headers.set(key, value);
				});
			},
		},
	});

	const { data } = await supabase.auth.getClaims();
	const { pathname } = request.nextUrl;

	const user = data?.claims;

	if (!user && pathname.startsWith(protectedRoute)) {
		const url = request.nextUrl.clone();
		url.pathname = publicRoute;
		return NextResponse.redirect(url);
	}

	if (user && pathname === publicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = protectedRoute;
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
