import { briom } from "@briom/container";
import type { Intent } from "@briom/domain/turn";

function sseEvent(event: string, data: unknown): string {
	return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const [{ roomId }, body] = await Promise.all([params, request.json()]);

	const result = await briom.streamParticipantResponse({
		roomId,
		targetParticipantId: body.participantId,
		intent: body.intent as Intent,
	});

	if (result.isSuccess()) {
		const { stream, persist } = result.value();
		const enc = new TextEncoder();

		const responseStream = new ReadableStream({
			async start(controller) {
				const reader = stream.getReader();
				let fullContent = "";

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						fullContent += value;
						controller.enqueue(enc.encode(sseEvent("token", { token: value })));
					}

					const turnId = await persist(fullContent);
					controller.enqueue(
						enc.encode(sseEvent("done", { content: fullContent, turnId })),
					);
					controller.close();
				} catch (err) {
					const message = err instanceof Error ? err.message : "Stream error";
					controller.enqueue(enc.encode(sseEvent("error", { message })));
					controller.close();
				}
			},
		});

		return new Response(responseStream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} else {
		const enc = new TextEncoder();
		const errStream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					enc.encode(sseEvent("error", { message: result.error().message })),
				);
				controller.close();
			},
		});

		return new Response(errStream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			},
		});
	}
}
