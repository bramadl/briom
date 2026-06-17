import { briom } from "@briom/container";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;
	const { turnId } = await request.json();

	try {
		await briom.markStreamFailed({ roomId, turnId });
		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ success: false, message: "Failed to mark turn as failed" },
			{ status: 500 },
		);
	}
}
