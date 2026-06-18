export type ScheduledTaskId = string;

export interface IScheduler {
	/**
	 * Cancel scheduled task
	 */
	cancel(taskId: ScheduledTaskId): void;

	/**
	 * Check if task is still scheduled
	 */
	isScheduled(taskId: ScheduledTaskId): boolean;

	/**
	 * Schedule a task to execute after delayMs
	 * @returns Task ID for cancellation
	 */
	schedule(
		taskId: ScheduledTaskId,
		delayMs: number,
		task: () => void | Promise<void>,
	): ScheduledTaskId;
}
