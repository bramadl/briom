import { briom } from "@briom";
import { NextResponse } from "next/server";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;

	const result = await briom.getRoom({ roomId });

	if (result.isError()) {
		return NextResponse.json(
			{ error: result.error().message },
			{ status: 404 },
		);
	}

	return NextResponse.json(result.value());
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;

	const body = await request.json();

	const result = await briom.renameRoom({ roomId, title: body.title });

	if (result.isError()) {
		return NextResponse.json(
			{ error: result.error().message },
			{ status: 404 },
		);
	}

	return NextResponse.json(result.value());
}
