import { getSupabaseServerEnvs } from "@briom/libs/get-env";
import { createClient } from "@supabase/supabase-js";

const { supabaseSecretKey, supabaseUrl } = getSupabaseServerEnvs();

/**
 * @description
 * Server-side Supabase client using the secret key.
 *
 * Used exclusively for publishing Realtime Broadcast events from the
 * backend. Never expose the secret key to the client.
 *
 * IDK WHY I HAVE THIS, udah ada `createSupabaseClient` dan `createSupabaseServerClient` lol.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
	realtime: {
		params: {
			eventsPerSecond: 20,
		},
	},
});
