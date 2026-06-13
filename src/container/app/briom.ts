import {
	AddUserMessageCommand,
	type AddUserMessageHandler,
	type AddUserMessageInput,
	CreateRoomCommand,
	type CreateRoomHandler,
	type CreateRoomInput,
	InviteParticipantCommand,
	type InviteParticipantHandler,
	type InviteParticipantInput,
	RequestParticipantResponseCommand,
	type RequestParticipantResponseHandler,
	type RequestParticipantResponseInput,
} from "@briom/app";

export interface BriomDeps {
	addUserMessage: AddUserMessageHandler;
	createRoom: CreateRoomHandler;
	inviteParticipant: InviteParticipantHandler;
	requestParticipantResponse: RequestParticipantResponseHandler;
}

export class Briom {
	constructor(private readonly deps: BriomDeps) {}

	public addUserMessage(input: AddUserMessageInput) {
		return this.deps.addUserMessage.execute(new AddUserMessageCommand(input));
	}

	public createRoom(input: CreateRoomInput) {
		return this.deps.createRoom.execute(new CreateRoomCommand(input));
	}

	public inviteParticipant(input: InviteParticipantInput) {
		return this.deps.inviteParticipant.execute(
			new InviteParticipantCommand(input),
		);
	}

	public requestParticipantResponse(input: RequestParticipantResponseInput) {
		return this.deps.requestParticipantResponse.execute(
			new RequestParticipantResponseCommand(input),
		);
	}
}
