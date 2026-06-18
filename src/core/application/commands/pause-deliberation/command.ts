export interface PauseDeliberationInput {
	roomId: string;
}

export class PauseDeliberationCommand {
	constructor(public readonly input: PauseDeliberationInput) {}
}
