export interface GetModeratorUsageInput {
	moderatorId: string;
}

export interface GetModeratorUsageOutput {
	limit: number;
	resetsAt: string;
	used: number;
}
