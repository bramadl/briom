import { briom } from "@briom";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;
	const body = await request.json();

	const result = await briom.addUserMessage({ roomId, content: body.content });

	if (result.isError()) {
		return NextResponse.json(
			{ error: result.error().message },
			{ status: 400 },
		);
	}

	const turn = result.value();
	return NextResponse.json(
		{
			id: turn.id.value(),
			sequenceNumber: turn.get("sequenceNumber"),
			content: turn.get("content"),
			author: turn.get("author"),
		},
		{ status: 201 },
	);
}
