import {
	AddUserMessageCommand,
	type AddUserMessageHandler,
	type AddUserMessageInput,
	CreateRoomCommand,
	type CreateRoomHandler,
	type CreateRoomInput,
	type GetAvailableModelsHandler,
	type GetAvailableModelsInput,
	GetAvailableModelsQuery,
	type GetRoomHandler,
	type GetRoomInput,
	GetRoomQuery,
	type GetRoomsHandler,
	type GetRoomsInput,
	GetRoomsQuery,
	InviteParticipantCommand,
	type InviteParticipantHandler,
	type InviteParticipantInput,
	RenameRoomCommand,
	type RenameRoomHandler,
	type RenameRoomInput,
	StreamParticipantResponseCommand,
	type StreamParticipantResponseHandler,
	type StreamParticipantResponseInput,
} from "@briom/app";

export interface BriomDeps {
	addUserMessage: AddUserMessageHandler;
	createRoom: CreateRoomHandler;
	getAvailableModels: GetAvailableModelsHandler;
	getRoom: GetRoomHandler;
	getRooms: GetRoomsHandler;
	inviteParticipant: InviteParticipantHandler;
	renameRoom: RenameRoomHandler;
	streamParticipantResponse: StreamParticipantResponseHandler;
}

export class Briom {
	constructor(private readonly deps: BriomDeps) {}

	public addUserMessage(input: AddUserMessageInput) {
		return this.deps.addUserMessage.execute(new AddUserMessageCommand(input));
	}

	public createRoom(input: CreateRoomInput) {
		return this.deps.createRoom.execute(new CreateRoomCommand(input));
	}

	public getAvailableModels(input: GetAvailableModelsInput) {
		return this.deps.getAvailableModels.execute(
			new GetAvailableModelsQuery(input),
		);
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

	public renameRoom(input: RenameRoomInput) {
		return this.deps.renameRoom.execute(new RenameRoomCommand(input));
	}

	public streamParticipantResponse(input: StreamParticipantResponseInput) {
		return this.deps.streamParticipantResponse.execute(
			new StreamParticipantResponseCommand(input),
		);
	}
}
