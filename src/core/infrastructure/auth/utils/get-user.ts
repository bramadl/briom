import { createAuthServerClient } from "@briom/supabase/auth/server";
import { ApplicationError } from "@drimion";

export async function getUser() {
	const supabase = await createAuthServerClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) throw ApplicationError.serviceUnavailable();
	if (!user) throw ApplicationError.unauthorized();

	return user;
}
