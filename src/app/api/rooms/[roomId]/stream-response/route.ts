import { toStreamEventError } from "@briom/api/contracts/errors";
import type { ApiError, StreamEventError } from "@briom/api/contracts/types";
import { briom } from "@briom/container";
import type { Intent } from "@briom/domain/turn";

function sseEvent(event: string, data: unknown): string {
	return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sseError(enc: TextEncoder, payload: StreamEventError): Uint8Array {
	return enc.encode(sseEvent("error", payload));
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	const [{ roomId }, body] = await Promise.all([params, request.json()]);
	const enc = new TextEncoder();

	const result = await briom.initiateStreaming({
		roomId,
		targetParticipantId: body.participantId,
		intent: body.intent as Intent,
	});

	// Pre-stream error — participant not found, room not found, provider rejected
	// before streaming. No pending row was written yet so no markFailed needed.
	if (result.isError()) {
		return new Response(
			new ReadableStream({
				start(controller) {
					controller.enqueue(sseError(enc, toStreamEventError(result.error())));
					controller.close();
				},
			}),
			{
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
				},
			},
		);
	}

	const { stream, turnId, persist, markFailed } = result.value();

	const responseStream = new ReadableStream({
		async start(controller) {
			const reader = stream.getReader();
			let fullContent = "";
			let errored = false;

			// Emit the pre-allocated turnId immediately so the FE knows which
			// pending row to watch — even before the first token arrives.
			controller.enqueue(enc.encode(sseEvent("start", { turnId })));

			try {
				// Consume stream tokens
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					fullContent += value;
					controller.enqueue(enc.encode(sseEvent("token", { token: value })));
				}

				// Empty response check — model returned nothing
				if (!fullContent.trim()) {
					errored = true;
					await markFailed();
					controller.enqueue(
						sseError(enc, {
							kind: "STREAM_FAILURE",
							message: "Model returned an empty response.",
						} satisfies ApiError),
					);
					controller.close();
					return;
				}

				// Persist settled turn to DB
				try {
					const settledTurnId = await persist(fullContent);
					controller.enqueue(
						enc.encode(
							sseEvent("done", { content: fullContent, turnId: settledTurnId }),
						),
					);
				} catch {
					// DB error post-stream — content streamed but not persisted
					errored = true;
					await markFailed();
					controller.enqueue(
						sseError(enc, {
							kind: "SERVER_ERROR",
							message: "Response received but could not be saved.",
						} satisfies ApiError),
					);
				}

				controller.close();
			} catch (err) {
				// Mid-stream error
				if (!errored) {
					errored = true;
					await markFailed().catch(() => {
						// best-effort — don't let markFailed swallow the original error
					});
				}
				controller.enqueue(sseError(enc, toStreamEventError(err)));
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
}
