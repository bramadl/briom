export interface ConcludeDeliberationInput {
	roomId: string;
}

export class ConcludeDeliberationCommand {
	constructor(public readonly input: ConcludeDeliberationInput) {}
}
