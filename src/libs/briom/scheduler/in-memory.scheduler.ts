import type { IScheduler } from "@briom/core/application";

export type ScheduledTaskId = string;

export class InMemoryScheduler implements IScheduler {
	private readonly tasks = new Map<ScheduledTaskId, NodeJS.Timeout>();

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
				console.error(`[InMemoryScheduler] Task ${taskId} failed`, error);
			}
		}, delayMs);

		this.tasks.set(taskId, timeout);
		return taskId;
	}

	public cancel(taskId: ScheduledTaskId): void {
		const existing = this.tasks.get(taskId);
		if (existing) {
			clearTimeout(existing);
			this.tasks.delete(taskId);
		}
	}

	public isScheduled(taskId: ScheduledTaskId): boolean {
		return this.tasks.has(taskId);
	}
}
