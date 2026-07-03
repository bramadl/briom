export interface ModeratorDTO {
	/**
	 * @description
	 * Profile picture URL, or null if not set.
	 */
	avatar: string | null;

	/**
	 * @description
	 * Current Briom Credit balance.
	 * Starts at 0; moves when paid models are used.
	 */
	credit: {
		/**
		 * @description
		 * BCr available to spend. Cannot go below zero.
		 */
		balance: number;
	};

	/**
	 * @description
	 * Verified email address. Used for auth and notifications.
	 */
	email: string;

	/**
	 * @description
	 * Stable identity, mapped to the Database auth UID.
	 */
	id: string;

	/**
	 * @description
	 * Display name shown across the platform. Minimum 4 characters.
	 */
	name: string;
}
