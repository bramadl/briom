import { resolveMediaType, SIZE_LIMIT } from "@briom/core/domain";

/**
 * @description
 * Some browsers (or OS-es) sometimes being weird by
 * reading typescript files (.ts) as video/mp2t–this
 * is a known (whitelist) extensions that we would
 * prolly only care atm.
 */
const EXTENSION_OVERRIDE: Record<string, string> = {
	ts: "text/x-typescript",
	tsx: "text/x-typescript",
	mts: "text/x-typescript",
	cts: "text/x-typescript",
};

function resolveMimeType(fileName: string, browserMime: string): string {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	if (EXTENSION_OVERRIDE[ext]) return EXTENSION_OVERRIDE[ext];
	return browserMime;
}

interface ValidationResult {
	error?: string;
	mediaType?: "text" | "image";
	mimeType?: string;
	ok: boolean;
}

export function validateFile(
	file: File,
	currentCount: number,
	maxAttachments: number,
): ValidationResult {
	if (currentCount >= maxAttachments) {
		return {
			ok: false,
			error: `Maximum ${maxAttachments} attachments per room.`,
		};
	}

	const mimeType = resolveMimeType(file.name, file.type);
	const mediaType = resolveMediaType(mimeType);
	if (!mediaType) {
		return {
			ok: false,
			error: `Unsupported file type: ${mimeType || "unknown"}.`,
		};
	}

	const limit = SIZE_LIMIT[mediaType];
	if (file.size > limit) {
		const limitKb = Math.round(limit / 1024);
		const actualKb = Math.round(file.size / 1024);
		return {
			ok: false,
			error: `File too large: ${actualKb} KB (limit ${limitKb} KB).`,
		};
	}

	return { ok: true, mediaType, mimeType };
}
