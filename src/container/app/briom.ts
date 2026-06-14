import {
	AddUserMessageCommand,
	type AddUserMessageHandler,
	type AddUserMessageInput,
	CreateRoomCommand,
	type CreateRoomHandler,
	type CreateRoomInput,
	type GetRoomHandler,
	type GetRoomInput,
	GetRoomQuery,
	type GetRoomsHandler,
	type GetRoomsInput,
	GetRoomsQuery,
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
	getRoom: GetRoomHandler;
	getRooms: GetRoomsHandler;
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

	public getRoom(input: GetRoomInput) {
		return this.deps.getRoom.execute(new GetRoomQuery(input));
	}
	public getRooms(input: GetRoomsInput) {
		return this.deps.getRooms.execute(new GetRoomsQuery(input));
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
