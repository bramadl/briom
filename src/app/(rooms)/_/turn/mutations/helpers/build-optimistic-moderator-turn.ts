import type {
	AttachmentInput,
	RoomDeliberationTurnAttachmentDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app";

interface BuildOptimisticModeratorTurnInput {
	attachments?: AttachmentInput[];
	clientTurnId?: string;
	content: string;
}

export function buildOptimisticModeratorTurn({
	attachments = [],
	clientTurnId,
	content,
}: BuildOptimisticModeratorTurnInput): RoomDeliberationTurnDTO {
	const attachmentDTOs: RoomDeliberationTurnAttachmentDTO[] = attachments.map(
		(a) => ({
			mediaType: a.mimeType.startsWith("image/") ? "image" : "text",
			mimeType: a.mimeType,
			name: a.name,
			sizeBytes: a.sizeBytes,
			url: a.url,
		}),
	);

	return {
		attachments: attachmentDTOs,
		author: { type: "moderator", profile: null },
		content,
		error: null,
		id: `optimistic-${clientTurnId}`,
		intent: null,
		status: "settled",
		createdAt: new Date().toISOString(),
		failedAt: null,
		settledAt: null,
	};
}
