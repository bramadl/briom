"use client";

import { getSupabaseClientEnvs } from "@briom/libs/get-env";
import { createBrowserClient } from "@supabase/ssr";

const { supabasePublishableKey, supabaseUrl } = getSupabaseClientEnvs();

/**
 * @description
 * Browser-side Supabase client using the publishable key.
 *
 * Upgraded from `createClient` to `createBrowserClient` (@supabase/ssr) to
 * support cookie-based session management required by Supabase Auth.
 *
 * **Dual purpose**
 * - Auth: session is automatically persisted/refreshed via cookies
 * - Realtime: still used for subscribing to Broadcast channels (use-room-sse.ts)
 *
 * **Channel security (MVP scope):** room channels are public by roomId UUID.
 * Private channels require Pro plan ("Allow public access" toggle) +
 * `realtime.messages` RLS policy. Defer until pre-launch hardening.
 */
export const supabaseClient = createBrowserClient(
	supabaseUrl,
	supabasePublishableKey,
);
