import {
  AddUserMessageHandler,
  CreateRoomHandler,
  GetRoomHandler,
  GetRoomsHandler,
  InviteParticipantHandler,
  RenameRoomHandler,
  StreamParticipantResponseHandler,
} from "@briom/app";

import type { domainSlice } from "./domain.slice";

export const applicationSlice = (container: ReturnType<typeof domainSlice>) => {
  return container
    .add("Command:CreateRoom", (r) => new CreateRoomHandler(r["Repository:Room"]))
    .add("Command:InviteParticipant", (r) =>
      new InviteParticipantHandler(r["Repository:Room"], r["Repository:Participant"]),
    )
    .add("Command:AddUserMessage", (r) =>
      new AddUserMessageHandler(
        r["Repository:Room"],
        r["Repository:Turn"],
        r["QueryService:TurnSequencer"],
      ),
    )
    .add("Command:RenameRoom", (r) => new RenameRoomHandler(r["Repository:Room"]))
    .add("Command:StreamParticipantResponse", (r) =>
      new StreamParticipantResponseHandler(
        r["Service:Orchestrator"],
        r["Repository:Room"],
        r["Repository:Participant"],
        r["Repository:Turn"],
      ),
    )
    .add("Query:GetRooms", (r) => new GetRoomsHandler(r["Client:Database"]))
    .add("Query:GetRoom", (r) => new GetRoomHandler(r["Client:Database"]));
};