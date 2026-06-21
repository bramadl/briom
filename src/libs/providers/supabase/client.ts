"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
if (!supabasePublishableKey) {
	throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");
}

/**
 * @description
 * Browser-side Supabase client using the publishable key.
 *
 * Used exclusively for subscribing to Realtime Broadcast channels.
 *
 * **Security note (MVP scope):** room channels are currently PUBLIC —
 * anyone who knows a roomId can subscribe to its broadcast events. This
 * is acceptable for the single-user MVP (no Supabase Auth yet). Once
 * multi-user auth lands, switch to private channels + RLS policies on
 * `realtime.messages` scoped by room ownership.
 */
export const supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
