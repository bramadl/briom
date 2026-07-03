import { ROOM_SETTING } from "../../room/config/setting";
import type { AttachmentMediaCategory } from "./attachment.types";

const EXTENSION_MIME_MAP: Record<string, string> = {
	/** ---- TypeScript / JavaScript */
	ts: "text/x-typescript",
	tsx: "text/x-typescript",
	js: "text/javascript",
	jsx: "text/javascript",
	mjs: "text/javascript",
	cjs: "text/javascript",
	/** ---- Systems / scripting */
	go: "text/x-go",
	py: "text/x-python",
	java: "text/x-java",
	rb: "text/x-ruby",
	rs: "text/x-rust",
	/** ---- Markup / config */
	md: "text/markdown",
	mdx: "text/markdown",
	yaml: "application/x-yaml",
	yml: "application/x-yaml",
	json: "application/json",
	toml: "text/plain",
	/** ---- Web */
	html: "text/html",
	htm: "text/html",
	css: "text/css",
	/** ---- Data / text */
	csv: "text/csv",
	txt: "text/plain",
	log: "text/plain",
	/** ---- Images */
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
};

export function guessMimeType(fileName: string, browserMime: string): string {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	if (EXTENSION_MIME_MAP[ext]) return EXTENSION_MIME_MAP[ext];
	if (browserMime && browserMime !== "application/octet-stream") {
		return browserMime;
	}
	return "text/plain";
}

export function getMediaCategory(
	mimeType: string,
): AttachmentMediaCategory | null {
	if (mimeType === "image/svg+xml") return null;
	if (mimeType.startsWith("image/")) return "image";
	if (
		mimeType.startsWith("text/") ||
		mimeType === "application/json" ||
		mimeType === "application/x-yaml"
	)
		return "text";
	return null;
}

export function extractStoragePath(url: string, bucket: string): string | null {
	const marker = `/${bucket}/`;
	const idx = url.indexOf(marker);
	return idx !== -1 ? url.slice(idx + marker.length) : null;
}

export type ValidationResult =
	| { ok: true; mimeType: string; category: AttachmentMediaCategory }
	| { ok: false; error: string };

export function validateFile(
	file: File,
	currentCount: number,
): ValidationResult {
	const mimeType = guessMimeType(file.name, file.type);

	if (currentCount >= ROOM_SETTING.MAX_ATTACHMENTS) {
		return {
			ok: false,
			error: `Maximum ${ROOM_SETTING.MAX_ATTACHMENTS} attachments per room.`,
		};
	}

	const category = getMediaCategory(mimeType);
	if (!category) {
		const ext = file.name.split(".").pop()?.toLowerCase() ?? "unknown";
		return {
			ok: false,
			error: `Unsupported file type: .${ext}. Supported: code files (.ts, .py, .go, ...), text (.md, .txt, .csv), images (.png, .jpg, .webp).`,
		};
	}

	const limit = ROOM_SETTING.ATTACHMENT.maxSizes[category];
	if (file.size > limit) {
		const limitKb = Math.round(limit / 1024);
		const actualKb = Math.round(file.size / 1024);
		return {
			ok: false,
			error: `File too large: ${actualKb} KB (limit ${limitKb} KB for ${category} files).`,
		};
	}

	return { ok: true, mimeType, category };
}
