import { sseForwarder } from "@briom";
import type { NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const { roomId } = await params;
	const clientId = request.headers.get("x-client-id") || crypto.randomUUID();

	const forwarder = sseForwarder;
	if (!forwarder) {
		return new Response("SSE not configured", { status: 500 });
	}

	return forwarder.subscribeClient(clientId, roomId);
}
