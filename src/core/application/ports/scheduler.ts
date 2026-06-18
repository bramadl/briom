/**
 * @description
 * Identifier for a scheduled task, used for cancellation.
 */
export type ScheduledTaskId = string;

/**
 * @description
 * `IScheduler` — Application Port
 *
 * Contract for scheduling delayed tasks (primarily turn timeout checks).
 * Abstracts the underlying timer mechanism (setTimeout, BullMQ, cron, etc.)
 * so the orchestrator remains timer-implementation-agnostic.
 *
 * **Why a Port?**
 * Timeout scheduling is infrastructure. In tests, you might want a mock
 * scheduler that doesn't actually wait. In production, you might want a
 * persistent scheduler that survives process restarts. The port lets you
 * swap without touching orchestrator logic.
 *
 * @see BriomScheduler — in-memory implementation using Node.js setTimeout
 */
export interface IScheduler {
	/**
	 * @description
	 * Cancels a previously scheduled task.
	 *
	 * @param taskId - The ID returned by schedule()
	 */
	cancel(taskId: ScheduledTaskId): void;

	/**
	 * @description
	 * Checks whether a task is still scheduled (not yet executed or cancelled).
	 *
	 * @param taskId - The task ID to check
	 */
	isScheduled(taskId: ScheduledTaskId): boolean;

	/**
	 * @description
	 * Schedules a task to execute after a delay.
	 *
	 * @param taskId - Unique identifier for this task (used for cancellation)
	 * @param delayMs - Delay in milliseconds before execution
	 * @param task - The function to execute
	 * @returns The task ID (same as input, for convenience)
	 */
	schedule(
		taskId: ScheduledTaskId,
		delayMs: number,
		task: () => void | Promise<void>,
	): ScheduledTaskId;
}
