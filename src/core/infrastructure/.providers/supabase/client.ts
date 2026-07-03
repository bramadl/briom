import { createClient } from "@supabase/supabase-js";

/**
 * @description
 * Secret-key Supabase client for server-side infrastructure use.
 */
export function createSupabaseServiceClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const secretKey = process.env.SUPABASE_SECRET_KEY;

	if (!supabaseUrl || !secretKey) {
		throw new Error(
			"NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required",
		);
	}

	return createClient(supabaseUrl, secretKey);
}

export type SupabaseServiceClient = ReturnType<
	typeof createSupabaseServiceClient
>;
