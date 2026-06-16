import {
	CreateRoomCommand,
	type CreateRoomHandler,
	type CreateRoomInput,
	DeleteRoomCommand,
	type DeleteRoomHandler,
	type DeleteRoomInput,
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
	SendMessageCommand,
	type SendMessageHandler,
	type SendMessageInput,
	StreamResponseCommand,
	type StreamResponseHandler,
	type StreamResponseInput,
} from "@briom/app";

export interface BriomDeps {
	createRoom: CreateRoomHandler;
	deleteRoom: DeleteRoomHandler;
	getAvailableModels: GetAvailableModelsHandler;
	getRoom: GetRoomHandler;
	getRooms: GetRoomsHandler;
	inviteParticipant: InviteParticipantHandler;
	renameRoom: RenameRoomHandler;
	sendMessage: SendMessageHandler;
	streamResponse: StreamResponseHandler;
}

export class Briom {
	constructor(private readonly deps: BriomDeps) {}

	public createRoom(input: CreateRoomInput) {
		return this.deps.createRoom.execute(new CreateRoomCommand(input));
	}

	public deleteRoom(input: DeleteRoomInput) {
		return this.deps.deleteRoom.execute(new DeleteRoomCommand(input));
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

	public sendMessage(input: SendMessageInput) {
		return this.deps.sendMessage.execute(new SendMessageCommand(input));
	}

	public initiateStreaming(input: StreamResponseInput) {
		return this.deps.streamResponse.execute(new StreamResponseCommand(input));
	}
}
