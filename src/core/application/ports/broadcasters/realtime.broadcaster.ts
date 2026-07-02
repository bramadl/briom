/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface IRealtimeBroadcaster {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	broadcast(
		channel: string,
		event: string,
		payload: Record<string, unknown>,
	): Promise<void>;
}
