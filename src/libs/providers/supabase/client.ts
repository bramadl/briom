import { getSupabaseClientEnvs } from "@briom/libs/get-env";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
	const { supabasePublishableKey, supabaseUrl } = getSupabaseClientEnvs();
	return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
