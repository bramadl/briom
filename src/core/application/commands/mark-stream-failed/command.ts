export type MarkStreamFailedInput = {
	roomId: string;
	turnId: string;
};

export type MarkStreamFailedOutput = never;

export class MarkStreamFailedCommand {
	public constructor(public readonly input: MarkStreamFailedInput) {}
}
