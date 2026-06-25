export interface TurnPerspectiveDTO {
	/**
	 * @description
	 * Complete or accumulated text content.
	 */
	content: string;

	/**
	 * @description
	 * ISO 8601 timestamp when perspective was finalized, null if not settled.
	 */
	renderedAt: string | null;
}
