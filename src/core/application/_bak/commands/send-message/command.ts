export type SendMessageInput = {
	roomId: string;
	content: string;
};

export type SendMessageOutput = { turnId: string };

export class SendMessageCommand {
	constructor(public readonly input: SendMessageInput) {}
}
