import { FileCodeIcon, FileIcon, ImageIcon } from "lucide-react";

export function getFileIcon(mimeType: string) {
	if (mimeType.startsWith("image/")) {
		return ImageIcon;
	} else if (
		mimeType.startsWith("text/x-") ||
		mimeType === "application/json" ||
		mimeType === "application/x-yaml"
	) {
		return FileCodeIcon;
	} else {
		return FileIcon;
	}
}

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${Math.round(bytes / 1024)} KB`;
}
