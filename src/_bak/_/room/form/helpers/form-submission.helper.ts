import type {
	InviteParticipantInput,
	InviteParticipantOutput,
} from "@briom/app/bak";
import {
	isServerError,
	type ServerActionResult,
} from "@briom/libs/server-action";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

export async function inviteSequentially({
	roomId,
	participants,
	invite,
}: {
	roomId: string;
	participants: Array<{
		displayName: string;
		model: string;
		provider: string;
	}>;
	invite: UseMutateAsyncFunction<
		ServerActionResult<InviteParticipantOutput>,
		Error,
		InviteParticipantInput,
		unknown
	>;
}) {
	const failed: Array<{ name: string; error: string }> = [];
	for (const p of participants) {
		const result = await invite({
			roomId,
			displayName: p.displayName,
			model: p.model,
			provider: p.provider,
		});

		if (isServerError(result)) {
			const name = p.displayName;
			const error = result.error.message;
			failed.push({ name, error });
		}
	}

	const summary = summarizeInviteResult(participants.length, failed);
	return { summary };
}

function summarizeInviteResult(
	total: number,
	failed: Array<{ name: string; error: string }>,
) {
	const success = total - failed.length;
	return {
		total,
		success,
		failed,
		hasPartialFailure: failed.length > 0,
	};
}
