import { briom } from "@briom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json();

	const result = await briom.createRoom({ title: body.title });

	if (result.isError()) {
		return NextResponse.json(
			{ error: result.error().message },
			{ status: 400 },
		);
	}

	const room = result.value();
	return NextResponse.json(
		{ id: room.id.value(), title: room.get("title") },
		{ status: 201 },
	);
}
