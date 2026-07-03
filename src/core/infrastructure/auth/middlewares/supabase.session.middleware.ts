import { createAuthServerClient } from "@briom/supabase/auth/server";
import { type NextRequest, NextResponse } from "next/server";

interface SessionConfig {
	protectedRoute: string;
	publicRoute?: string;
}

export async function supabaseSessionMiddleware(
	request: NextRequest,
	{ protectedRoute, publicRoute = "/" }: SessionConfig,
) {
	const [supabase, response] = await createAuthServerClient(
		request,
		NextResponse.next({ request }),
	);

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

	return response;
}
