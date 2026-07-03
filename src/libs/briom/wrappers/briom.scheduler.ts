import type { IScheduler } from "@briom/app/bak";

/**
 * @description
 * Scheduled task identifier for cancellation and lookup.
 */
export type ScheduledTaskId = string;

/**
 * @description
 * `BriomScheduler` — Infrastructure Scheduler
 *
 * In-memory implementation of IScheduler using Node.js setTimeout.
 * Manages scheduled timeout checks for turn lifecycle protection.
 *
 * **Why In-Memory?**
 * MVP scope: single-process deployment. For multi-process or persistent
 * scheduling, we will replace with Redis/BullMQ implementation.
 *
 * **Error Handling**
 * Task failures are caught and logged — scheduler errors must not crash
 * the application or prevent other tasks from running.
 *
 * **Memory Management**
 * Completed tasks are automatically removed from the internal Map.
 * Cancelled tasks are also removed to prevent memory leaks.
 *
 * @see IScheduler — domain contract
 * @see TurnTimeoutPolicy — for threshold configuration
 * @see TurnLifecycleOrchestrator — for timeout scheduling
 */
export class BriomScheduler implements IScheduler {
	private readonly tasks = new Map<ScheduledTaskId, NodeJS.Timeout>();

	/**
	 * @description
	 * Schedules a task to execute after a delay.
	 *
	 * Cancels any existing task with the same ID before scheduling.
	 *
	 * @param taskId - Unique identifier for this task
	 * @param delayMs - Delay in milliseconds
	 * @param task - Function to execute
	 * @returns The task ID
	 */
	public schedule(
		taskId: ScheduledTaskId,
		delayMs: number,
		task: () => void | Promise<void>,
	): ScheduledTaskId {
		this.cancel(taskId);

		const timeout = setTimeout(async () => {
			this.tasks.delete(taskId);
			try {
				await task();
			} catch (error) {
				console.error(`[BriomScheduler] Task ${taskId} failed`, error);
			}
		}, delayMs);

		this.tasks.set(taskId, timeout);
		return taskId;
	}

	/**
	 * @description
	 * Cancels a scheduled task before it executes.
	 *
	 * @param taskId - Task ID to cancel
	 */
	public cancel(taskId: ScheduledTaskId): void {
		const existing = this.tasks.get(taskId);
		if (existing) {
			clearTimeout(existing);
			this.tasks.delete(taskId);
		}
	}

	/**
	 * @description
	 * Checks whether a task is still scheduled.
	 *
	 * @param taskId - Task ID to check
	 * @returns True if scheduled and not yet executed
	 */
	public isScheduled(taskId: ScheduledTaskId): boolean {
		return this.tasks.has(taskId);
	}
}
