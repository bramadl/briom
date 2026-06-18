import { toServerActionError } from "@briom/app/_bak/api/contracts/errors";
import { briom } from "@briom/container";
import { NextResponse } from "next/server";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ roomId: string; turnId: string }> },
) {
	const { roomId, turnId } = await params;
	const result = await briom.deleteTurn({ roomId, turnId });

	if (result.isError()) {
		const error = toServerActionError(result.error());
		const status = error.kind === "NOT_FOUND" ? 404 : 409;
		return NextResponse.json({ success: false, error }, { status });
	}

	return NextResponse.json({ success: true });
}
