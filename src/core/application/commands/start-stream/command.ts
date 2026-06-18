export interface StartStreamInput {
	turnId: string;
}

export class StartStreamCommand {
	constructor(public readonly input: StartStreamInput) {}
}
