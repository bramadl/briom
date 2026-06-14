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
