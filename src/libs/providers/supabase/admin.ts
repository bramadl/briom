import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) throw new Error("SUPABASE_URL is required");
if (!supabaseSecretKey) throw new Error("SUPABASE_SECRET_KEY is required");

/**
 * @description
 * Server-side Supabase client using the secret key.
 *
 * Used exclusively for publishing Realtime Broadcast events from the
 * backend. Never expose the secret key to the client.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
	realtime: {
		params: {
			eventsPerSecond: 20,
		},
	},
});
