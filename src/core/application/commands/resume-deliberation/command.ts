export interface ResumeDeliberationInput {
	roomId: string;
}

export class ResumeDeliberationCommand {
	constructor(public readonly input: ResumeDeliberationInput) {}
}
