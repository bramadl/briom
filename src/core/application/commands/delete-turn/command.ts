export type DeleteTurnInput = {
	roomId: string;
	turnId: string;
};

export type DeleteTurnOutput = never;

export class DeleteTurnCommand {
	public constructor(public readonly input: DeleteTurnInput) {}
}
