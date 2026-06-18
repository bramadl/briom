export interface StartDeliberationInput {
	roomId: string;
	topic: string;
}

export class StartDeliberationCommand {
	constructor(public readonly input: StartDeliberationInput) {}
}
