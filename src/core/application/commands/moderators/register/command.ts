/**
 * @description
 * Input data required to execute the `RegisterModerator` command.
 */
export interface RegisterModeratorInput {
	/**
	 * @description
	 * Avatar URL for the Moderator.
	 *
	 * Auth Provider usually provides this.
	 */
	avatar: string | null;

	/**
	 * @description
	 * Email of the Moderator.
	 *
	 * Auth Provider usually provides this.
	 */
	email: string;

	/**
	 * @description
	 * Received from Auth provider (e.g.: Supabase Auth) used to
	 * reference this moderator.
	 */
	id: string;

	/**
	 * @description
	 * Name of the Moderator.
	 *
	 * Auth Provider usually provides this.
	 */
	name: string;
}

/**
 * @description
 * Output data returned after the `RegisterModerator` command executes successfully.
 */
export type RegisterModeratorOutput = {
	/**
	 * @description
	 * Resolved Moderator ID after the successful process.
	 */
	moderatorId: string;
};

/**
 * @description
 * A command that register a Moderator and setting up their account.
 *
 * Most of the data needed are usually provided by Auth provider.
 */
export class RegisterModeratorCommand {
	public constructor(public readonly input: RegisterModeratorInput) {}
}
