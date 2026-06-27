export function getSupabaseServerEnvs() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
	const supabasePublishableKey =
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
	if (!supabaseSecretKey) throw new Error("SUPABASE_SECRET_KEY is required");
	if (!supabasePublishableKey)
		throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");

	return { supabasePublishableKey, supabaseSecretKey, supabaseUrl };
}

export function getSupabaseClientEnvs() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabasePublishableKey =
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
	if (!supabasePublishableKey)
		throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");

	return { supabaseUrl, supabasePublishableKey };
}
