import { getSupabaseServerEnvs } from "@briom/libs/get-env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
	const cookieStore = await cookies();
	const { supabasePublishableKey, supabaseUrl } = getSupabaseServerEnvs();

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
