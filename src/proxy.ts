import type { NextRequest } from "next/server";

import { supabaseSessionMiddleware } from "./core/infrastructure/auth";

export async function proxy(request: NextRequest) {
	return await supabaseSessionMiddleware(request, { protectedRoute: "/rooms" });
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
