import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseServerEnvs } from "./libs/get-env";

export async function proxy(request: NextRequest) {
	const { supabasePublishableKey, supabaseUrl } = getSupabaseServerEnvs();

	let response = NextResponse.next({ request });
	const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}

				response = NextResponse.next({ request });
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options);
				}
			},
		},
	});

	const { pathname } = request.nextUrl;
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user && pathname.startsWith("/rooms")) {
		return NextResponse.redirect(new URL("/", request.url));
	} else if (user && pathname === "/") {
		return NextResponse.redirect(new URL("/rooms", request.url));
	}

	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
