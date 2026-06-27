"use server";

import { createSupabaseServerClient } from "@briom/libs/providers/supabase/server";
import { redirect } from "next/navigation";

const DICEBEAR_URL = "https://api.dicebear.com";

export async function getModerator() {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/");

	const avatar =
		(user.user_metadata.avatar_url as string | undefined) ??
		`${DICEBEAR_URL}/9.x/initials/svg?seed=${encodeURIComponent(user.user_metadata.full_name ?? user.email ?? "")}&backgroundColor=6366f1`;

	const moderator = {
		id: user.id,
		email: user.email ?? "",
		name:
			(user.user_metadata.full_name as string | undefined) ??
			user.email?.split("@")[0] ??
			"Moderator",
		avatar: avatar,
	};

	return moderator;
}
