"use server";

import { briom } from "@briom/container";
import { redirect } from "next/navigation";

export async function getRoom(roomId: string) {
  const result = await briom.getRoom({ roomId });
  if (result.isError()) throw new Error(result.error().message);
  return result.value();
}

export async function createRoom(title: string) {
  const result = await briom.createRoom({ title });
  if (result.isError()) throw new Error(result.error().message);
  const room = result.value();
  redirect(`/rooms/${room.id.value()}`);
}

export async function renameRoom(roomId: string, title: string) {
  const result = await briom.renameRoom({ roomId, title });
  if (result.isError()) throw new Error(result.error().message);
}

export async function inviteParticipant(
  roomId: string,
  provider: string,
  model: string,
  displayName: string,
) {
  const result = await briom.inviteParticipant({
    roomId,
    provider,
    model,
    displayName,
  });
  if (result.isError()) throw new Error(result.error().message);
  return result.value();
}

export async function addUserMessage(roomId: string, content: string) {
  const result = await briom.addUserMessage({ roomId, content });
  if (result.isError()) throw new Error(result.error().message);
  return result.value();
}