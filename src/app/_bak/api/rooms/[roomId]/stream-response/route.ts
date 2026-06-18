import { toStreamEventError } from "@briom/app/_bak/api/contracts/errors";
import type {
	ApiError,
	StreamEventError,
} from "@briom/app/_bak/api/contracts/types";
import { briom } from "@briom/container";
import type { Intent } from "@briom/domain/turn";

const ONE_MINUTE = 60000;
const FIVETEEN_MINUTES = ONE_MINUTE * 15;

const SERVER_TIMEOUT =
	process.env.USE_FREE_MODELS === "true" ? FIVETEEN_MINUTES : ONE_MINUTE;

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
			let clientAborted = false;
			let doneReceived = false;
			let errored = false;
			let fullContent = "";
			let persisting = false;

			request.signal.addEventListener("abort", () => {
				clientAborted = true;
				clearTimeout(timeout);
				reader.cancel().catch(() => {});

				if (!errored && !doneReceived && !persisting) {
					errored = true;
					markFailed().catch(() => {});
				}
			});

			const timeout = setTimeout(() => {
				if (!errored && !doneReceived) {
					errored = true;

					if (!fullContent.trim()) markFailed().catch(() => {});
					controller.enqueue(
						sseError(enc, {
							kind: "STREAM_FAILURE",
							message: `Stream timed out after ${SERVER_TIMEOUT / 1000} seconds.`,
						} satisfies ApiError),
					);
					controller.close();
				}
			}, SERVER_TIMEOUT);

			controller.enqueue(enc.encode(sseEvent("start", { turnId })));
			try {
				while (true) {
					if (clientAborted) break;

					const { done, value } = await reader.read();
					if (done) break;

					fullContent += value;
					controller.enqueue(enc.encode(sseEvent("token", { token: value })));
				}

				if (!errored && !clientAborted) {
					clearTimeout(timeout);

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

					try {
						persisting = true;
						const settledTurnId = await persist(fullContent);

						doneReceived = true;
						persisting = false;

						controller.enqueue(
							enc.encode(
								sseEvent("done", {
									content: fullContent,
									turnId: settledTurnId,
								}),
							),
						);
					} catch {
						persisting = false;
						errored = true;

						await markFailed();
						controller.enqueue(
							sseError(enc, {
								kind: "SERVER_ERROR",
								message: "Response received but could not be saved.",
							} satisfies ApiError),
						);
					}
				}

				controller.close();
			} catch (err) {
				if (!errored && !doneReceived) {
					errored = true;
					clearTimeout(timeout);

					await markFailed().catch(() => {});
					controller.enqueue(sseError(enc, toStreamEventError(err)));
				}

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
