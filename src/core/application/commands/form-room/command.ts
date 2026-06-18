export interface FormRoomInput {
	moderatorId: string;
	title: string;
}

export interface FormRoomOutput {
	roomId: string;
}

export class FormRoomCommand {
	constructor(public readonly input: FormRoomInput) {}
}
