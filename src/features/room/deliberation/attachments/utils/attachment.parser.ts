import type { AttachmentContent } from "@briom/core/domain";

export async function parseAttachmentContent(
	file: File,
	mediaType: "text" | "image",
): Promise<AttachmentContent> {
	if (mediaType === "image") {
		const base64 = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error("Failed to read image file"));
			reader.readAsDataURL(file);
		});
		return { mediaType: "image", base64 };
	}

	const text = await file.text();
	return { mediaType: "text", text };
}
