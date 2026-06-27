import { createSupabaseServerClient } from "../server";

import { UnauthorizedError } from "./error";

/**
 * @description
 * `getAuthenticatedModerator` — Session Guard
 *
 * Validates the current Supabase session and returns the authenticated user's
 * ID. Must be called at the top of every server action that operates on
 * moderator-owned resources.
 *
 * **Why this exists (Phase 7)**
 * Before this, `moderatorId` was passed from the client (via `useModerator()`),
 * which means any user could spoof another user's ID in the request payload.
 * This helper removes that attack surface — the moderator identity is now
 * sourced exclusively from the validated server-side JWT.
 *
 * @throws {UnauthorizedError} if no valid session exists
 *
 * @example
 * export async function formRoom(input: Omit<FormRoomInput, "moderatorId">) {
 *   const { id: moderatorId } = await getAuthenticatedModerator();
 *   return briom.rooms.form({ ...input, moderatorId });
 * }
 */
export async function getAuthenticatedModerator(): Promise<{ id: string }> {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) throw new UnauthorizedError();

	return { id: user.id };
}
