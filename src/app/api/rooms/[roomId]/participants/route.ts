import { briom } from "@briom";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;
	const body = await request.json();

	const result = await briom.inviteParticipant({
		roomId,
		provider: body.provider,
		model: body.model,
		displayName: body.displayName,
	});

	if (result.isError()) {
		return NextResponse.json(
			{ error: result.error().message },
			{ status: 400 },
		);
	}

	const participant = result.value();
	return NextResponse.json(
		{
			id: participant.id.value(),
			displayName: participant.get("displayName"),
			provider: participant.get("provider"),
			model: participant.get("model"),
		},
		{ status: 201 },
	);
}
